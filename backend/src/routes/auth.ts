import { Router } from 'express';
import passport from 'passport';
import { authLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { registerSchema, loginSchema } from '../utils/validation';
import { AuthController } from '../controllers/authController';
import { SocialAuthController } from '../controllers/socialAuthController';

const router = Router();

// 應用認證限制（社交登录路由除外）
router.use((req, res, next) => {
  if (!req.path.includes('/google') && !req.path.includes('/facebook') && !req.path.includes('/apple')) {
    authLimiter(req, res, next);
  } else {
    next();
  }
});

// 註冊
router.post('/register', 
  validateRequest(registerSchema),
  AuthController.register
);

// 登入
router.post('/login',
  validateRequest(loginSchema),
  AuthController.login
);

// 刷新 Token
router.post('/refresh', AuthController.refreshToken);

// 登出
router.post('/logout', AuthController.logout);

// 忘記密碼
router.post('/forgot-password', AuthController.forgotPassword);

// 重置密碼
router.post('/reset-password', AuthController.resetPassword);

// 社交登录路由
// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google_auth_failed` }),
  SocialAuthController.googleCallback
);

// Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=facebook_auth_failed` }),
  SocialAuthController.facebookCallback
);

// Apple
router.post('/apple', passport.authenticate('apple'));
router.post('/apple/callback',
  passport.authenticate('apple', { session: false }),
  SocialAuthController.appleCallback
);

export default router;


