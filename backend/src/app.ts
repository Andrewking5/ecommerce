import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 載入環境變數
dotenv.config();

// 導入 Passport 配置
import './config/passport';

// 導入中介軟體
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { securityMiddleware } from './middleware/security';
import { generalLimiter } from './middleware/rateLimiter';
import { i18nMiddleware } from './i18n/config';

// 導入路由
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import healthRoutes from './routes/health';
import adminRoutes from './routes/admin';
import categoryRoutes from './routes/categories';
import inventoryRoutes from './routes/inventory';

// 初始化 Prisma 客戶端
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// 建立 Express 應用程式
const app = express();

// 安全中介軟體
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' },
}));

// CORS 設定
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL,
      'https://ecommerce-frontend-liard-omega.vercel.app',
    ].filter(Boolean);
    
    // 調試日誌
    if (process.env.NODE_ENV === 'production') {
      console.log('🌐 CORS check:', {
        origin,
        allowedOrigins,
        frontendUrl: process.env.FRONTEND_URL,
        isAllowed: !origin || allowedOrigins.includes(origin || ''),
      });
    }
    
    if (!origin) {
      // 允許沒有 origin 的請求（例如 Postman、服務器端請求、健康檢查等）
      // 這是正常的，因為某些請求（如 Render 的健康檢查、curl、Postman）沒有 origin 頭
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
}));

// 壓縮回應
app.use(compression());

// 請求限制
app.use(generalLimiter);

// i18n 國際化中間件（必須在請求日誌之前，以便錯誤處理可以使用翻譯）
app.use(i18nMiddleware);

// 請求日誌
app.use(requestLogger);

// 解析 JSON 和 URL 編碼的請求主體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 靜態檔案服務
app.use('/uploads', express.static('uploads'));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/inventory', inventoryRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// 404 處理（必须在所有路由之后，错误处理之前）
app.use(notFound);

// 錯誤處理中介軟體（必须在最后）
app.use(errorHandler);

// 優雅關閉處理在 server.ts 中統一管理

export default app;


