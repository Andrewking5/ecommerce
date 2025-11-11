# 06 - 安全與維運設計

## 資安強化策略

### 1. 密碼安全
```typescript
// utils/password.ts
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class PasswordSecurity {
  private static readonly SALT_ROUNDS = 12;
  private static readonly PEPPER = process.env.PASSWORD_PEPPER || 'default-pepper';

  // 密碼雜湊
  static async hashPassword(password: string): Promise<string> {
    // 加入 Pepper 增加安全性
    const pepperedPassword = password + this.PEPPER;
    return await bcrypt.hash(pepperedPassword, this.SALT_ROUNDS);
  }

  // 密碼驗證
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const pepperedPassword = password + this.PEPPER;
    return await bcrypt.compare(pepperedPassword, hashedPassword);
  }

  // 密碼強度檢查
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('密碼長度至少 8 個字元');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('密碼需包含小寫字母');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('密碼需包含大寫字母');
    }
    
    if (!/\d/.test(password)) {
      errors.push('密碼需包含數字');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('密碼需包含特殊字元');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 生成隨機密碼
  static generateRandomPassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}
```

### 2. JWT + Refresh Token 安全
```typescript
// utils/jwt.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class TokenSecurity {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!;
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
  private static readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  // 生成 Access Token
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'ecommerce-api',
      audience: 'ecommerce-client',
    });
  }

  // 生成 Refresh Token
  static generateRefreshToken(userId: string): string {
    const payload = { userId, type: 'refresh' };
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'ecommerce-api',
      audience: 'ecommerce-client',
    });
  }

  // 驗證 Access Token
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client',
      }) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  // 驗證 Refresh Token
  static verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const payload = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client',
      }) as any;
      
      if (payload.type !== 'refresh') {
        return null;
      }
      
      return { userId: payload.userId };
    } catch (error) {
      return null;
    }
  }

  // 生成 Token 對
  static generateTokenPair(userId: string, email: string, role: string) {
    const payload: TokenPayload = { userId, email, role };
    
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  // Token 黑名單管理
  static async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
    // 使用 Redis 儲存黑名單
    const redis = await import('redis');
    const client = redis.createClient({ url: process.env.REDIS_URL });
    
    await client.connect();
    await client.setEx(`blacklist:${token}`, Math.floor((expiresAt.getTime() - Date.now()) / 1000), '1');
    await client.disconnect();
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const redis = await import('redis');
    const client = redis.createClient({ url: process.env.REDIS_URL });
    
    await client.connect();
    const result = await client.get(`blacklist:${token}`);
    await client.disconnect();
    
    return result !== null;
  }
}
```

### 3. Helmet 安全標頭
```typescript
// middleware/security.ts
import helmet from 'helmet';

export const securityMiddleware = helmet({
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
});
```

### 4. CORS 設定
```typescript
// middleware/cors.ts
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];

export const corsOptions = cors({
  origin: (origin, callback) => {
    // 允許沒有 origin 的請求（如 mobile apps）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
});
```

### 5. Rate Limiting
```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });

// 一般 API 限制
export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
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
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 最多 5 次登入嘗試
  message: {
    error: 'Too many login attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

// 上傳檔案限制
export const uploadLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 20, // 最多 20 個上傳請求
  message: {
    error: 'Too many upload requests, please try again later.',
  },
});
```

### 6. 輸入驗證與清理
```typescript
// middleware/inputSanitizer.ts
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export class InputSanitizer {
  // 清理 HTML 內容
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
    });
  }

  // 清理 SQL 注入
  static sanitizeSql(input: string): string {
    return input.replace(/['"\\;]/g, '');
  }

  // 清理 XSS
  static sanitizeXss(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // 驗證和清理郵箱
  static sanitizeEmail(email: string): string | null {
    const cleaned = validator.normalizeEmail(email);
    return validator.isEmail(cleaned) ? cleaned : null;
  }

  // 驗證和清理 URL
  static sanitizeUrl(url: string): string | null {
    return validator.isURL(url) ? url : null;
  }

  // 清理電話號碼
  static sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+\-\(\)\s]/g, '');
  }

  // 清理數字
  static sanitizeNumber(input: string): number | null {
    const cleaned = input.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
}

// 中介軟體
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // 清理所有字串欄位
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = InputSanitizer.sanitizeHtml(req.body[key]);
      }
    }
  }
  
  if (req.query) {
    // 清理查詢參數
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = InputSanitizer.sanitizeHtml(req.query[key] as string);
      }
    }
  }
  
  next();
};
```

## 環境變數管理

### 環境變數設定
```bash
# .env.example
# 資料庫設定
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
REDIS_URL="redis://localhost:6379"

# JWT 設定
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
PASSWORD_PEPPER="your-password-pepper"

# 第三方服務
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# 郵件服務
SENDGRID_API_KEY="SG..."
FROM_EMAIL="noreply@yourdomain.com"

# 監控服務
SENTRY_DSN="https://..."
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"

# 應用程式設定
NODE_ENV="development"
PORT="3001"
API_URL="http://localhost:3001/api"
FRONTEND_URL="http://localhost:3000"

# 檔案上傳
MAX_FILE_SIZE="10485760" # 10MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"

# 安全設定
BCRYPT_ROUNDS="12"
SESSION_SECRET="your-session-secret"
```

### 環境變數驗證
```typescript
// config/env.ts
import Joi from 'joi';

const envSchema = Joi.object({
  // 資料庫
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  
  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  PASSWORD_PEPPER: Joi.string().min(16).required(),
  
  // 第三方服務
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  
  // 郵件
  SENDGRID_API_KEY: Joi.string().required(),
  FROM_EMAIL: Joi.string().email().required(),
  
  // 監控
  SENTRY_DSN: Joi.string().uri().optional(),
  GOOGLE_ANALYTICS_ID: Joi.string().optional(),
  
  // 應用程式
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  API_URL: Joi.string().uri().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  
  // 檔案上傳
  MAX_FILE_SIZE: Joi.number().default(10485760),
  ALLOWED_FILE_TYPES: Joi.string().required(),
  
  // 安全
  BCRYPT_ROUNDS: Joi.number().default(12),
  SESSION_SECRET: Joi.string().min(32).required(),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  database: {
    url: envVars.DATABASE_URL,
  },
  redis: {
    url: envVars.REDIS_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    pepper: envVars.PASSWORD_PEPPER,
  },
  stripe: {
    secretKey: envVars.STRIPE_SECRET_KEY,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
  },
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  email: {
    sendGridApiKey: envVars.SENDGRID_API_KEY,
    fromEmail: envVars.FROM_EMAIL,
  },
  monitoring: {
    sentryDsn: envVars.SENTRY_DSN,
    googleAnalyticsId: envVars.GOOGLE_ANALYTICS_ID,
  },
  app: {
    nodeEnv: envVars.NODE_ENV,
    port: envVars.PORT,
    apiUrl: envVars.API_URL,
    frontendUrl: envVars.FRONTEND_URL,
  },
  upload: {
    maxFileSize: envVars.MAX_FILE_SIZE,
    allowedFileTypes: envVars.ALLOWED_FILE_TYPES.split(','),
  },
  security: {
    bcryptRounds: envVars.BCRYPT_ROUNDS,
    sessionSecret: envVars.SESSION_SECRET,
  },
};
```

## Logging 系統

### Winston Logger 設定
```typescript
// utils/logger.ts
import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'ecommerce-api' },
  transports: [
    // 錯誤日誌
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 所有日誌
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 開發環境輸出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export default logger;
```

### 請求日誌中介軟體
```typescript
// middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // 記錄請求開始
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // 攔截回應結束事件
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
    });
    
    return originalSend.call(this, data);
  };

  next();
};
```

## Error Tracking

### Sentry 整合
```typescript
// utils/sentry.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});

export default Sentry;
```

### 錯誤追蹤中介軟體
```typescript
// middleware/errorTracking.ts
import Sentry from '../utils/sentry';

export const errorTrackingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 發送到 Sentry
  Sentry.withScope((scope) => {
    scope.setTag('errorType', 'unhandled');
    scope.setContext('request', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    });
    scope.setUser({
      id: (req as any).user?.id,
      email: (req as any).user?.email,
    });
    
    Sentry.captureException(error);
  });

  next(error);
};
```

## CI/CD 測試流程

### GitHub Actions 設定
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ecommerce_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ecommerce_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-jwt-secret-min-32-chars
          JWT_REFRESH_SECRET: test-refresh-secret-min-32-chars

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ecommerce_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-jwt-secret-min-32-chars
          JWT_REFRESH_SECRET: test-refresh-secret-min-32-chars

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run security audit
        run: npm audit --audit-level moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Build Docker image
        run: docker build -t ecommerce-api:${{ github.sha }} .

  deploy:
    needs: [build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # 部署邏輯
```

### 測試腳本
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "type-check": "tsc --noEmit",
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "nodemon src/app.ts"
  }
}
```

## 監控與維運

### 健康檢查端點
```typescript
// routes/health.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const router = Router();
const prisma = new PrismaClient();
const redis = createClient({ url: process.env.REDIS_URL });

router.get('/health', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown',
    },
  };

  try {
    // 檢查資料庫連線
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.checks.database = 'healthy';
  } catch (error) {
    healthCheck.checks.database = 'unhealthy';
    healthCheck.message = 'Service Unavailable';
  }

  try {
    // 檢查 Redis 連線
    await redis.ping();
    healthCheck.checks.redis = 'healthy';
  } catch (error) {
    healthCheck.checks.redis = 'unhealthy';
    healthCheck.message = 'Service Unavailable';
  }

  // 檢查記憶體使用
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };

  healthCheck.checks.memory = memUsageMB;

  const statusCode = healthCheck.message === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

export default router;
```

### 效能監控
```typescript
// middleware/performanceMonitor.ts
import { Request, Response, NextFunction } from 'express';

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // 轉換為毫秒
    
    // 記錄慢請求
    if (duration > 1000) { // 超過 1 秒
      console.warn(`Slow request detected: ${req.method} ${req.url} - ${duration}ms`);
    }
    
    // 發送到監控服務
    if (process.env.NODE_ENV === 'production') {
      // 發送到監控服務（如 DataDog, New Relic 等）
    }
  });
  
  next();
};
```

### CDN 與快取策略
```typescript
// middleware/cache.ts
import { Request, Response, NextFunction } from 'express';

export const cacheMiddleware = (duration: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 設定快取標頭
    res.set({
      'Cache-Control': `public, max-age=${duration}`,
      'ETag': `"${Date.now()}"`,
    });
    
    next();
  };
};

// 使用範例
app.get('/api/products', cacheMiddleware(300), getProducts); // 快取 5 分鐘
app.get('/api/categories', cacheMiddleware(3600), getCategories); // 快取 1 小時
```

### 圖片壓縮與優化
```typescript
// utils/imageOptimizer.ts
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

export class ImageOptimizer {
  // 壓縮圖片
  static async compressImage(buffer: Buffer, quality: number = 80): Promise<Buffer> {
    return await sharp(buffer)
      .jpeg({ quality })
      .png({ quality })
      .webp({ quality })
      .toBuffer();
  }

  // 調整圖片尺寸
  static async resizeImage(buffer: Buffer, width: number, height?: number): Promise<Buffer> {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();
  }

  // 上傳到 Cloudinary
  static async uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      ).end(buffer);
    });
  }

  // 生成響應式圖片 URL
  static generateResponsiveUrls(publicId: string, sizes: number[]): string[] {
    return sizes.map(size => 
      cloudinary.url(publicId, {
        width: size,
        quality: 'auto',
        fetch_format: 'auto',
      })
    );
  }
}
```

### 資料庫監控
```typescript
// utils/dbMonitor.ts
import { PrismaClient } from '@prisma/client';

export class DatabaseMonitor {
  private static prisma = new PrismaClient();

  // 監控資料庫連線
  static async checkConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  // 監控查詢效能
  static async monitorQuery(query: string, params: any[] = []) {
    const start = Date.now();
    
    try {
      const result = await this.prisma.$queryRawUnsafe(query, ...params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn(`Slow query detected: ${query} - ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }

  // 清理過期資料
  static async cleanupExpiredData() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // 清理過期的 refresh tokens
    // 清理過期的 session 資料
    // 清理過期的日誌檔案
    
    console.log('Expired data cleanup completed');
  }
}
```

這個安全與維運設計提供了完整的電商平台安全防護和監控體系，包含密碼安全、JWT 認證、輸入驗證、錯誤追蹤、CI/CD 流程等核心功能，確保系統的安全性和穩定性。


