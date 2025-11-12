import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';

// Google OAuth 配置
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // 構建完整的回調 URL
  const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || 
    (process.env.NODE_ENV === 'production' 
      ? `${process.env.API_URL || 'https://ecommerce-1w9j.onrender.com'}/api/auth/google/callback`
      : 'http://localhost:3001/api/auth/google/callback');
  
  console.log('🔐 Google OAuth Callback URL:', googleCallbackURL);
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallbackURL,
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );
}

// Facebook OAuth 配置
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  // 構建完整的回調 URL
  const facebookCallbackURL = process.env.FACEBOOK_CALLBACK_URL || 
    (process.env.NODE_ENV === 'production' 
      ? `${process.env.API_URL || 'https://ecommerce-1w9j.onrender.com'}/api/auth/facebook/callback`
      : 'http://localhost:3001/api/auth/facebook/callback');
  
  console.log('🔐 Facebook OAuth Callback URL:', facebookCallbackURL);
  
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: facebookCallbackURL,
        profileFields: ['id', 'email', 'name', 'picture.type(large)'],
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );
}

export default passport;

