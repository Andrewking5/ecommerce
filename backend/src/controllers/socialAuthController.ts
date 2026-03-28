import { Request, Response } from 'express';
import { prisma } from '../app';
import { AuthController } from './authController';

interface SocialUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  provider: 'GOOGLE' | 'FACEBOOK';
  providerData?: any;
}

export class SocialAuthController {
  // 处理社交登录回调
  static async handleSocialCallback(
    profile: SocialUserProfile,
    res: Response
  ): Promise<void> {
    try {
      const { id, email, firstName, lastName, avatar, provider, providerData } = profile;

      // 验证 email 是否存在
      if (!email || email.trim() === '') {
        throw new Error('EMAIL_REQUIRED');
      }

      // 查找或创建用户
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { provider, providerId: id },
          ],
        },
      });

      if (user) {
        // 如果用户存在但使用不同的登录方式
        if (user.provider !== provider || user.providerId !== id) {
          // 检查 email 是否已被其他用户使用（非社交登录用户）
          if (user.email === email && user.provider !== provider && user.provider !== 'EMAIL') {
            throw new Error('EMAIL_ALREADY_EXISTS');
          }
          // 如果 email 匹配但 provider 不同，且原用户是 EMAIL 登录，不允许社交登录绑定
          if (user.email === email && user.provider === 'EMAIL') {
            throw new Error('EMAIL_ALREADY_REGISTERED');
          }
          
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              provider: provider as any,
              providerId: id,
              providerData: providerData || {},
              // 优先使用新的头像和姓名（如果提供）
              avatar: avatar !== null && avatar !== undefined && avatar !== '' ? avatar : (user.avatar || null),
              firstName: firstName && firstName !== 'User' ? firstName : (user.firstName || firstName),
              lastName: lastName || user.lastName || '',
            },
          });
        } else {
          // 更新用户信息（头像等可能变化）
          // 每次登录时更新最新的头像和姓名
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              // 优先使用新的头像和姓名（社交登录应该总是更新）
              avatar: avatar !== null && avatar !== undefined && avatar !== '' ? avatar : (user.avatar || null),
              firstName: firstName && firstName !== 'User' ? firstName : (user.firstName || firstName),
              lastName: lastName || user.lastName || '',
              providerData: providerData || user.providerData,
            },
          });
        }
      } else {
        // 检查 email 是否已被其他用户使用
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          // 如果 email 已被使用，且是邮箱注册的用户，提示用户使用邮箱登录
          if (existingUser.provider === 'EMAIL') {
            throw new Error('EMAIL_ALREADY_REGISTERED');
          }
          // 如果 email 已被其他社交登录使用
          throw new Error('EMAIL_ALREADY_EXISTS');
        }

        // 创建新用户
        user = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            avatar,
            provider: provider as any,
            providerId: id,
            providerData: providerData || {},
            password: null, // 社交登录用户没有密码
            role: 'USER',
            isActive: true,
          },
        });
      }

      // 生成 JWT tokens
      const tokens = AuthController.generateTokens(user.id, user.email, user.role);
      AuthController.setRefreshCookie(res, tokens.refreshToken);

      // 重定向到前端并携带 accessToken only (refreshToken is HttpOnly cookie)
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('token', tokens.accessToken);
      redirectUrl.searchParams.set('success', 'true');

      res.redirect(redirectUrl.toString());
      return;
    } catch (error: any) {
      console.error('Social auth callback error:', error);
      
      // 重定向到前端并显示错误
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('success', 'false');
      
      // 根据错误类型设置友好的错误消息
      let errorMessage = 'Authentication failed';
      if (error.message === 'EMAIL_REQUIRED') {
        errorMessage = 'EMAIL_REQUIRED';
      } else if (error.message === 'EMAIL_ALREADY_REGISTERED') {
        errorMessage = 'EMAIL_ALREADY_REGISTERED';
      } else if (error.message === 'EMAIL_ALREADY_EXISTS') {
        errorMessage = 'EMAIL_ALREADY_EXISTS';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      redirectUrl.searchParams.set('error', errorMessage);

      res.redirect(redirectUrl.toString());
      return;
    }
  }

  // Google 登录回调
  static async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const profile = req.user as any;
      
      // 調試日誌：查看完整的 profile 數據
      console.log('📧 Google profile data:', {
        id: profile?.id || profile?.sub,
        email: profile?.email,
        emails: profile?.emails,
        name: profile?.name,
        given_name: profile?.given_name,
        family_name: profile?.family_name,
        hasEmail: !!profile?.email,
        profileKeys: profile ? Object.keys(profile) : [],
      });
      
      if (!profile) {
        throw new Error('No profile data received from Google');
      }

      // 尝试多种方式获取 email
      const email = profile.email || profile.emails?.[0]?.value || profile.emails?.[0];
      
      if (!email) {
        console.error('❌ Google profile missing email:', JSON.stringify(profile, null, 2));
        throw new Error('EMAIL_REQUIRED');
      }

      // Google profile 数据结构：
      // - id 或 sub: 用户 ID
      // - emails: [{ value: 'email@example.com' }] 或 email: 'email@example.com'
      // - name: { givenName: 'John', familyName: 'Doe' } 或 given_name/family_name
      // - photos: [{ value: 'https://...' }] 或 picture: 'https://...'
      
      // 提取姓名（多种可能的结构）
      let firstName = 'User';
      let lastName = '';
      
      if (profile.name?.givenName) {
        firstName = profile.name.givenName;
        lastName = profile.name.familyName || '';
      } else if (profile.given_name) {
        firstName = profile.given_name;
        lastName = profile.family_name || '';
      } else if (profile.firstName) {
        firstName = profile.firstName;
        lastName = profile.lastName || '';
      } else if (profile.name && typeof profile.name === 'string') {
        // 如果 name 是字符串，尝试拆分
        const nameParts = profile.name.split(' ');
        firstName = nameParts[0] || 'User';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // 提取头像（多种可能的结构）
      let avatar: string | undefined = undefined;
      
      if (profile.photos && profile.photos.length > 0) {
        // Google 返回 photos 数组
        avatar = profile.photos[0].value || profile.photos[0];
      } else if (profile.picture) {
        // 直接是 URL 字符串
        avatar = typeof profile.picture === 'string' ? profile.picture : profile.picture;
      } else if (profile.avatar) {
        avatar = typeof profile.avatar === 'string' ? profile.avatar : profile.avatar;
      }
      
      // 确保头像 URL 是完整的 HTTPS URL
      if (avatar && !avatar.startsWith('http')) {
        avatar = `https://${avatar}`;
      }

      const socialProfile: SocialUserProfile = {
        id: profile.id || profile.sub,
        email: email,
        firstName,
        lastName,
        avatar: avatar || undefined,
        provider: 'GOOGLE',
        providerData: {
          name: profile.name,
          verified_email: profile.verified_email,
          locale: profile.locale,
          rawProfile: profile, // 保存完整 profile 用于调试
        },
      };
      
      console.log('✅ Google profile processed:', {
        id: socialProfile.id,
        email: socialProfile.email,
        firstName: socialProfile.firstName,
        lastName: socialProfile.lastName,
        hasAvatar: !!socialProfile.avatar,
        avatar: socialProfile.avatar,
      });

      await SocialAuthController.handleSocialCallback(socialProfile, res);
      return;
    } catch (error: any) {
      console.error('Google callback error:', error);
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('success', 'false');
      
      // 根据错误类型设置友好的错误消息
      let errorMessage = 'Google authentication failed';
      if (error.message === 'EMAIL_REQUIRED') {
        errorMessage = 'EMAIL_REQUIRED';
      } else if (error.message === 'EMAIL_ALREADY_REGISTERED') {
        errorMessage = 'EMAIL_ALREADY_REGISTERED';
      } else if (error.message === 'EMAIL_ALREADY_EXISTS') {
        errorMessage = 'EMAIL_ALREADY_EXISTS';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      redirectUrl.searchParams.set('error', errorMessage);
      res.redirect(redirectUrl.toString());
      return;
    }
  }

  // Facebook 登录回调
  static async facebookCallback(req: Request, res: Response): Promise<void> {
    try {
      const profile = req.user as any;
      
      // 調試日誌：查看完整的 profile 數據
      console.log('📧 Facebook profile data:', {
        id: profile?.id,
        email: profile?.email,
        emails: profile?.emails,
        name: profile?.name,
        hasEmail: !!profile?.email,
        profileKeys: profile ? Object.keys(profile) : [],
      });
      
      if (!profile) {
        throw new Error('No profile data received from Facebook');
      }

      // 尝试多种方式获取 email
      const email = profile.email || profile.emails?.[0]?.value || profile.emails?.[0];
      
      if (!email) {
        console.error('❌ Facebook profile missing email:', JSON.stringify(profile, null, 2));
        throw new Error('EMAIL_REQUIRED');
      }

      // Facebook profile 数据结构：
      // - id: 用户 ID
      // - email: 'email@example.com'
      // - name: 'John Doe' (完整姓名)
      // - picture: { data: { url: 'https://...' } } 或 photos: [{ value: 'https://...' }]
      
      // 提取姓名（Facebook 可能返回多种格式）
      let firstName = 'User';
      let lastName = '';
      
      // 方式1: 使用 first_name 和 last_name（如果 Passport 配置了这些字段）
      if ((profile as any).first_name) {
        firstName = (profile as any).first_name;
        lastName = (profile as any).last_name || '';
      }
      // 方式2: 使用 name 对象
      else if (profile.name?.givenName) {
        firstName = profile.name.givenName;
        lastName = profile.name.familyName || '';
      }
      // 方式3: name 是字符串，需要拆分
      else if (profile.name && typeof profile.name === 'string') {
        const nameParts = profile.name.trim().split(/\s+/);
        firstName = nameParts[0] || 'User';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      // 方式4: 从 _json 获取
      else if ((profile as any)._json?.first_name) {
        firstName = (profile as any)._json.first_name;
        lastName = (profile as any)._json.last_name || '';
      }
      
      // 提取头像（Facebook 可能返回多种结构）
      let avatar: string | undefined = undefined;
      
      // 方式1: picture.data.url (最常见)
      if (profile.picture?.data?.url) {
        avatar = profile.picture.data.url;
      }
      // 方式2: picture 直接是 URL
      else if (profile.picture && typeof profile.picture === 'string') {
        avatar = profile.picture;
      }
      // 方式3: photos 数组
      else if (profile.photos && profile.photos.length > 0) {
        avatar = profile.photos[0].value || profile.photos[0];
      }
      // 方式4: _json.picture.data.url
      else if ((profile as any)._json?.picture?.data?.url) {
        avatar = (profile as any)._json.picture.data.url;
      }
      
      // 确保头像 URL 是完整的 HTTPS URL
      if (avatar && !avatar.startsWith('http')) {
        avatar = `https://${avatar}`;
      }

      const socialProfile: SocialUserProfile = {
        id: profile.id,
        email: email,
        firstName,
        lastName,
        avatar: avatar || undefined,
        provider: 'FACEBOOK',
        providerData: {
          name: profile.name,
          rawProfile: profile, // 保存完整 profile 用于调试
        },
      };
      
      console.log('✅ Facebook profile processed:', {
        id: socialProfile.id,
        email: socialProfile.email,
        firstName: socialProfile.firstName,
        lastName: socialProfile.lastName,
        hasAvatar: !!socialProfile.avatar,
        avatar: socialProfile.avatar,
      });

      await SocialAuthController.handleSocialCallback(socialProfile, res);
      return;
    } catch (error: any) {
      console.error('Facebook callback error:', error);
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('success', 'false');
      
      // 根据错误类型设置友好的错误消息
      let errorMessage = 'Facebook authentication failed';
      if (error.message === 'EMAIL_REQUIRED') {
        errorMessage = 'EMAIL_REQUIRED';
      } else if (error.message === 'EMAIL_ALREADY_REGISTERED') {
        errorMessage = 'EMAIL_ALREADY_REGISTERED';
      } else if (error.message === 'EMAIL_ALREADY_EXISTS') {
        errorMessage = 'EMAIL_ALREADY_EXISTS';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      redirectUrl.searchParams.set('error', errorMessage);
      res.redirect(redirectUrl.toString());
      return;
    }
  }
}

