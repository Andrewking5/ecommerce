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
              // 如果新头像存在则使用，否则保留旧头像（null 或 undefined 都保留旧值）
              avatar: avatar !== null && avatar !== undefined ? avatar : user.avatar,
              firstName: firstName || user.firstName,
              lastName: lastName || user.lastName,
            },
          });
        } else {
          // 更新用户信息（头像等可能变化）
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              // 如果新头像存在则使用，否则保留旧头像（null 或 undefined 都保留旧值）
              avatar: avatar !== null && avatar !== undefined ? avatar : user.avatar,
              firstName: firstName || user.firstName,
              lastName: lastName || user.lastName,
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

      // 重定向到前端并携带 token
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('token', tokens.accessToken);
      redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
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

      const socialProfile: SocialUserProfile = {
        id: profile.id || profile.sub,
        email: email, // 使用提取的 email
        firstName: profile.given_name || profile.firstName || 'User',
        lastName: profile.family_name || profile.lastName || '',
        avatar: profile.picture || profile.avatar || undefined, // 确保类型正确
        provider: 'GOOGLE',
        providerData: {
          name: profile.name,
          verified_email: profile.verified_email,
          locale: profile.locale,
          rawProfile: profile, // 保存完整 profile 用于调试
        },
      };

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

      // Facebook 返回的 name 需要拆分
      const nameParts = (profile.name || '').split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      const socialProfile: SocialUserProfile = {
        id: profile.id,
        email: email, // 使用提取的 email
        firstName,
        lastName,
        avatar: profile.picture?.data?.url || profile.photos?.[0]?.value || undefined, // 确保类型正确
        provider: 'FACEBOOK',
        providerData: {
          name: profile.name,
          rawProfile: profile, // 保存完整 profile 用于调试
        },
      };

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

