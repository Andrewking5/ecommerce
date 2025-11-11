import rateLimit from 'express-rate-limit';

// 一般 API 限制
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 最多 100 個請求
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 認證 API 限制
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 最多 5 次登入嘗試
  message: {
    error: 'Too many login attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

// 上傳檔案限制
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 20, // 最多 20 個上傳請求
  message: {
    error: 'Too many upload requests, please try again later.',
  },
});


