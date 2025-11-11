import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
// @ts-ignore - passport-apple 没有类型定义
import { Strategy as AppleStrategy } from 'passport-apple';

// Google OAuth 配置
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );
}

// Facebook OAuth 配置
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
        profileFields: ['id', 'email', 'name', 'picture.type(large)'],
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );
}

// Apple OAuth 配置
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID) {
  try {
    passport.use(
      new AppleStrategy(
        {
          clientID: process.env.APPLE_CLIENT_ID,
          teamID: process.env.APPLE_TEAM_ID,
          keyID: process.env.APPLE_KEY_ID,
          privateKeyString: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          callbackURL: process.env.APPLE_CALLBACK_URL || '/api/auth/apple/callback',
        },
        (accessToken: string, refreshToken: string, idToken: string, profile: any, done: (error: any, user?: any) => void) => {
          return done(null, profile);
        }
      )
    );
  } catch (error) {
    console.warn('Apple OAuth configuration error:', error);
  }
}

export default passport;

