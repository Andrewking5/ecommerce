# 04 - 後端架構設計

## 技術棧總覽

### 核心技術
- **Node.js 18+**：JavaScript 運行環境
- **Express.js**：Web 應用框架
- **TypeScript**：型別安全的 JavaScript
- **Prisma**：現代化 ORM
- **PostgreSQL**：關聯式資料庫

### 認證與安全
- **JWT + Refresh Token**：無狀態認證
- **bcrypt**：密碼雜湊
- **Helmet**：安全標頭
- **CORS**：跨域資源共享
- **Rate Limiting**：請求限制

### 檔案處理
- **Multer**：檔案上傳
- **Cloudinary**：圖片處理與 CDN
- **Sharp**：圖片壓縮

### 支付整合
- **Stripe**：支付處理
- **Webhook**：支付狀態同步

## 專案結構

```
backend/
├── src/
│   ├── controllers/        # 控制器層
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── orderController.ts
│   │   ├── userController.ts
│   │   └── uploadController.ts
│   ├── services/           # 業務邏輯層
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── orderService.ts
│   │   ├── emailService.ts
│   │   └── paymentService.ts
│   ├── models/             # 資料模型
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   └── Cart.ts
│   ├── middleware/         # 中介軟體
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── logger.ts
│   ├── routes/             # 路由定義
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── users.ts
│   │   └── upload.ts
│   ├── utils/              # 工具函數
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   ├── validation.ts
│   │   ├── email.ts
│   │   └── helpers.ts
│   ├── types/              # TypeScript 型別
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── api.ts
│   ├── config/             # 設定檔
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── cloudinary.ts
│   │   └── stripe.ts
│   └── app.ts              # 應用程式入口
├── prisma/                 # 資料庫 schema
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/                  # 測試檔案
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/                   # API 文件
│   └── api.md
├── .env.example            # 環境變數範例
├── package.json
├── tsconfig.json
└── jest.config.js
```

## API 規劃

### RESTful API 設計原則
- **資源導向**：URL 代表資源，HTTP 方法代表操作
- **無狀態**：每個請求包含所有必要資訊
- **統一介面**：一致的 API 設計模式
- **分層系統**：客戶端不需要知道是否直接連接到伺服器

### API 端點設計

#### 認證相關 API
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

// POST /api/auth/logout
// POST /api/auth/forgot-password
// POST /api/auth/reset-password
```

#### 商品相關 API
```typescript
// GET /api/products
interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

// GET /api/products/:id
// POST /api/products (Admin only)
// PUT /api/products/:id (Admin only)
// DELETE /api/products/:id (Admin only)

// GET /api/products/categories
// GET /api/products/search?q=keyword
```

#### 購物車相關 API
```typescript
// GET /api/cart
// POST /api/cart/items
interface AddToCartRequest {
  productId: string;
  quantity: number;
}

// PUT /api/cart/items/:itemId
interface UpdateCartItemRequest {
  quantity: number;
}

// DELETE /api/cart/items/:itemId
// DELETE /api/cart
```

#### 訂單相關 API
```typescript
// GET /api/orders
// GET /api/orders/:id
// POST /api/orders
interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
}

// PUT /api/orders/:id/status (Admin only)
// GET /api/orders/user/:userId (Admin only)
```

## Middleware 設計

### 認證中介軟體
```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

### 請求驗證中介軟體
```typescript
// middleware/validation.ts
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message),
      });
    }
    
    next();
  };
};

// 驗證 schema 範例
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
});

export const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  stock: Joi.number().integer().min(0).required(),
});
```

### 錯誤處理中介軟體
```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // 記錄錯誤
  console.error(`Error ${statusCode}: ${message}`);
  console.error(error.stack);

  // 發送到錯誤追蹤服務
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  }

  // 生產環境不暴露詳細錯誤
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`) as AppError;
  error.statusCode = 404;
  next(error);
};
```

### 請求限制中介軟體
```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// 一般 API 限制
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 最多 100 個請求
  message: {
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 認證 API 限制
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 最多 5 次登入嘗試
  message: {
    message: 'Too many login attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

// 上傳檔案限制
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 20, // 最多 20 個上傳請求
  message: {
    message: 'Too many upload requests, please try again later.',
  },
});
```

## 業務邏輯層設計

### 認證服務
```typescript
// services/authService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
  // 用戶註冊
  static async register(userData: RegisterData) {
    const { email, password, firstName, lastName, phone } = userData;

    // 檢查用戶是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // 密碼雜湊
    const hashedPassword = await bcrypt.hash(password, 12);

    // 創建用戶
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'user',
      },
    });

    // 生成 JWT tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // 用戶登入
  static async login(email: string, password: string) {
    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // 生成 JWT tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // 刷新 Token
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const tokens = this.generateTokens(user.id, user.email, user.role);
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // 生成 JWT Tokens
  private static generateTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // 清理用戶資料（移除敏感資訊）
  private static sanitizeUser(user: any) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
```

### 商品服務
```typescript
// services/productService.ts
export class ProductService {
  // 獲取商品列表
  static async getProducts(params: ProductQueryParams) {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
    } = params;

    const skip = (page - 1) * limit;

    // 建構查詢條件
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    // 執行查詢
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // 計算平均評分
    const productsWithRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length,
    }));

    return {
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 獲取單一商品
  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  // 創建商品（管理員）
  static async createProduct(productData: CreateProductData, userId: string) {
    // 驗證管理員權限
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        createdBy: userId,
      },
      include: {
        category: true,
      },
    });

    return product;
  }

  // 更新商品（管理員）
  static async updateProduct(id: string, productData: UpdateProductData, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
      },
    });

    return updatedProduct;
  }

  // 刪除商品（管理員）
  static async deleteProduct(id: string, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // 軟刪除：設定 isActive 為 false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Product deleted successfully' };
  }
}
```

### 訂單服務
```typescript
// services/orderService.ts
export class OrderService {
  // 創建訂單
  static async createOrder(orderData: CreateOrderData, userId: string) {
    const { items, shippingAddress, billingAddress, paymentMethod } = orderData;

    // 驗證商品庫存
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // 檢查庫存
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }
    }

    // 計算總金額
    const totalAmount = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product!.price * item.quantity);
    }, 0);

    // 創建訂單
    const order = await prisma.order.create({
      data: {
        userId,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: products.find(p => p.id === item.productId)!.price,
          })),
        },
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        totalAmount,
        status: 'pending',
        paymentMethod,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // 更新商品庫存
    await Promise.all(
      items.map(item =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      )
    );

    return order;
  }

  // 更新訂單狀態
  static async updateOrderStatus(orderId: string, status: OrderStatus, userId: string) {
    // 驗證管理員權限
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    // 發送狀態更新通知
    await EmailService.sendOrderStatusUpdate(order.user.email, order);

    return order;
  }

  // 獲取用戶訂單
  static async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

## 資料驗證

### Joi Schema 定義
```typescript
// utils/validation.ts
import Joi from 'joi';

export const schemas = {
  // 用戶註冊
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
  }),

  // 用戶登入
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // 商品創建
  product: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().required(),
    images: Joi.array().items(Joi.string().uri()).min(1).required(),
    stock: Joi.number().integer().min(0).required(),
    specifications: Joi.object().optional(),
  }),

  // 訂單創建
  order: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
    billingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
    }).optional(),
    paymentMethod: Joi.string().valid('stripe', 'paypal').required(),
  }),
};
```

## 測試策略

### Jest 設定
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

### 單元測試範例
```typescript
// tests/unit/authService.test.ts
import { AuthService } from '../../src/services/authService';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');
const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await AuthService.register(userData);

      expect(result.user.email).toBe(userData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(AuthService.register(userData)).rejects.toThrow('User already exists');
    });
  });
});
```

### 整合測試範例
```typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.accessToken).toBeDefined();
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        firstName: '',
        lastName: '',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation error');
    });
  });
});
```

## 部署流程

### Docker 設定
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 複製 package 檔案
COPY package*.json ./
COPY prisma ./prisma/

# 安裝依賴
RUN npm ci --only=production

# 複製原始碼
COPY . .

# 建構應用程式
RUN npm run build

# 生成 Prisma 客戶端
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/ecommerce
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ecommerce
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

這個後端架構設計提供了完整的現代化 API 服務，包含認證、商品管理、訂單處理等核心功能，同時注重安全性、可測試性和可擴展性。


