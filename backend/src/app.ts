import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';

// 載入環境變數
dotenv.config();

// 初始化 Sentry（在所有中間件之前）
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    sendDefaultPii: true,
  });
  console.log('✅ Sentry initialized');
}

// 導入 Passport 配置
import './config/passport';

// 導入中介軟體
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { securityMiddleware } from './middleware/security';
import { generalLimiter } from './middleware/rateLimiter';
import { csrfProtection } from './middleware/csrf';
import { i18nMiddleware } from './i18n/config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

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
import paymentRoutes from './routes/payment';
import couponRoutes from './routes/coupons';
import reviewRoutes from './routes/reviews';
import addressRoutes from './routes/addresses';
import attributeRoutes from './routes/attributes';
import variantRoutes from './routes/variants';
import contactRoutes from './routes/contact';
import newsletterRoutes from './routes/newsletter';
import bannerRoutes from './routes/banners';
import customConfigRoutes from './routes/customConfigs';
import wishlistRoutes from './routes/wishlist';

// 初始化 Prisma 客戶端
// 自動為 DATABASE_URL 附加連線池參數（若尚未設定）
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || '';
  if (!url) return url;
  const hasPoolParams = /connection_limit|pool_timeout|connect_timeout/.test(url);
  if (hasPoolParams) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}connection_limit=5&pool_timeout=20&connect_timeout=10`;
}

const databaseUrl = getDatabaseUrl();
if (databaseUrl && databaseUrl !== process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
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
      imgSrc: ["'self'", "data:", "https:", "http://localhost:3001", "http://localhost:5173", "http://localhost:3000"],
      scriptSrc: ["'self'", "https://www.googletagmanager.com"],
      connectSrc: ["'self'", "http://localhost:3001", "http://localhost:5173", "http://localhost:3000", "https://www.google-analytics.com", "https://www.googletagmanager.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null, // 开发环境不强制 HTTPS
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

    if (!origin) {
      // 允許沒有 origin 的請求（例如 Postman、服務器端請求、健康檢查等）
      return callback(null, true);
    }

    // 允許已列出的來源 + 開發環境的區域網路 IP（192.168.x.x / 172.x.x.x / 10.x.x.x）
    const isAllowed = allowedOrigins.includes(origin);
    const isLocalNetwork = process.env.NODE_ENV !== 'production' && /^https?:\/\/(192\.168\.|172\.(1[6-9]|2\d|3[01])\.|10\.|127\.)/.test(origin);

    if (isAllowed || isLocalNetwork) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
}));

// 壓縮回應
// 响应压缩 - 优化API响应大小
app.use(compression({
  filter: (req, res) => {
    // 只压缩文本类型的响应
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // 压缩级别 (1-9, 6是平衡点)
  threshold: 1024, // 只压缩大于1KB的响应
}));

// 請求限制
app.use(generalLimiter);

// i18n 國際化中間件（必須在請求日誌之前，以便錯誤處理可以使用翻譯）
app.use(i18nMiddleware);

// 請求日誌
app.use(requestLogger);

// 解析 JSON 和 URL 編碼的請求主體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CSRF 保護（在 API 路由之前）
app.use('/api', csrfProtection);

// HTTP Cache Headers for public GET endpoints
app.use('/api/products', (req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  }
  next();
});
app.use('/api/banners', (req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=600');
  }
  next();
});

// 靜態檔案服務（添加 CORS 支持）
app.use('/uploads', (req, res, next): void => {
  // 設置 CORS 頭
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    'https://ecommerce-frontend-liard-omega.vercel.app',
  ].filter(Boolean);

  const isAllowed = origin && allowedOrigins.includes(origin);
  const isLocalNetwork = origin && process.env.NODE_ENV !== 'production' && /^https?:\/\/(192\.168\.|172\.(1[6-9]|2\d|3[01])\.|10\.|127\.)/.test(origin);

  if (isAllowed || isLocalNetwork) {
    res.setHeader('Access-Control-Allow-Origin', origin!);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
}, express.static('uploads'));

// Swagger API 文件
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Ayers Guitars API Docs',
}));

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
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/custom-configs', customConfigRoutes);
app.use('/api/wishlist', wishlistRoutes);

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

// Sentry 錯誤處理（必須在自訂 errorHandler 之前）
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// 錯誤處理中介軟體（必须在最后）
app.use(errorHandler);

// 優雅關閉處理在 server.ts 中統一管理

export default app;


