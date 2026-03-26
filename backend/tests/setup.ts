/**
 * Test Setup — Global mocks and helpers for the backend test suite.
 *
 * This file:
 *  1. Sets required env vars BEFORE any app code is imported.
 *  2. Provides a fully-mocked Prisma client so no real DB is needed.
 *  3. Mocks the i18n middleware (req.t returns the key itself).
 *  4. Mocks EmailService to prevent real emails.
 *  5. Mocks PaymentService / Stripe to prevent real payment calls.
 *  6. Disables rate limiting so tests are not throttled.
 *  7. Exports helpers to generate valid JWT tokens for tests.
 */

import jwt from 'jsonwebtoken';

// ─── 1. Environment variables ────────────────────────────────────────────────
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-unit-tests';
process.env.NODE_ENV = 'test';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake';

// ─── 2. Mock Prisma ──────────────────────────────────────────────────────────
// We build a mock object that mirrors every Prisma model method used by controllers.

const buildModelMock = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
});

export const mockPrisma: Record<string, any> = {
  user: buildModelMock(),
  product: buildModelMock(),
  order: buildModelMock(),
  orderItem: buildModelMock(),
  category: buildModelMock(),
  payment: buildModelMock(),
  coupon: buildModelMock(),
  review: buildModelMock(),
  cartItem: buildModelMock(),
  productVariant: buildModelMock(),
  userAddress: buildModelMock(),
  $transaction: jest.fn((fn: any) => fn(mockPrisma)),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

// Mock @prisma/client so that `new PrismaClient()` returns our mock
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Prisma: {
      PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
        code: string;
        meta?: any;
        constructor(message: string, { code, meta }: { code: string; meta?: any }) {
          super(message);
          this.code = code;
          this.meta = meta;
          this.name = 'PrismaClientKnownRequestError';
        }
      },
    },
  };
});

// Mock @prisma/client/runtime/library for Decimal
jest.mock('@prisma/client/runtime/library', () => ({
  Decimal: jest.fn((value: any) => Number(value)),
}));

// ─── 3. Mock rate limiters (no-op) ──────────────────────────────────────────
jest.mock('../src/middleware/rateLimiter', () => {
  const passthrough = (_req: any, _res: any, next: any) => next();
  return {
    generalLimiter: passthrough,
    authLimiter: passthrough,
    uploadLimiter: passthrough,
  };
});

// ─── 4. Mock i18n middleware — req.t returns the key itself ──────────────────
jest.mock('../src/i18n/config', () => {
  const i18nMiddleware = (req: any, _res: any, next: any) => {
    req.language = 'en';
    req.t = (key: string, _opts?: any) => key;
    next();
  };
  return {
    i18nMiddleware,
    default: { t: (key: string) => key, changeLanguage: jest.fn() },
  };
});

// ─── 5. Mock Passport (prevent Google/Facebook strategy registration) ────────
jest.mock('../src/config/passport', () => ({}));

// ─── 6. Mock EmailService ────────────────────────────────────────────────────
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/emailService', () => ({
  EmailService: {
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    sendOrderStatusUpdate: jest.fn().mockResolvedValue(undefined),
  },
}));

// ─── 7. Mock PaymentService ──────────────────────────────────────────────────
jest.mock('../src/services/paymentService', () => ({
  PaymentService: {
    createPaymentIntent: jest.fn(),
    verifyWebhookSignature: jest.fn(),
    handleWebhook: jest.fn(),
    getPaymentStatus: jest.fn(),
    createRefund: jest.fn(),
  },
}));

// ─── 8. Mock CacheService (always miss) ──────────────────────────────────────
jest.mock('../src/services/cacheService', () => ({
  CacheService: {
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
    delete: jest.fn(),
    deleteByPrefix: jest.fn(),
    generateKey: jest.fn((...args: any[]) => JSON.stringify(args)),
  },
  CACHE_KEYS: {
    PRODUCTS: 'products',
    PRODUCT: 'product',
    CATEGORIES: 'categories',
  },
}));

// ─── 9. Mock productHelpers that touch Prisma directly ───────────────────────
jest.mock('../src/utils/productHelpers', () => ({
  normalizeImages: jest.fn((images: any) => {
    if (Array.isArray(images)) return images;
    if (images) return [String(images)];
    return [];
  }),
  normalizeStock: jest.fn((stock: any) => {
    const n = Number(stock);
    return isNaN(n) ? 0 : Math.max(0, Math.floor(n));
  }),
  resolveCategoryId: jest.fn().mockResolvedValue('cat-1'),
  checkProductNameExists: jest.fn().mockResolvedValue(false),
}));

// ─── 10. No need to mock ../src/app ──────────────────────────────────────────
// Since @prisma/client is mocked above, `new PrismaClient()` in app.ts returns
// mockPrisma. All controllers that `import { prisma } from '../app'` will
// naturally receive mockPrisma. The default export (the Express app) remains real.

// ─── Helper: generate tokens ─────────────────────────────────────────────────

export interface TestUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  password?: string;
  provider?: string;
  isActive?: boolean;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const testUser: TestUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'USER',
  firstName: 'Test',
  lastName: 'User',
  phone: null,
  provider: 'EMAIL',
  isActive: true,
  avatar: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const testAdmin: TestUser = {
  id: 'admin-1',
  email: 'admin@example.com',
  role: 'ADMIN',
  firstName: 'Admin',
  lastName: 'User',
  phone: null,
  provider: 'EMAIL',
  isActive: true,
  avatar: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

/** Generate a valid access token for the given user fields. */
export function generateAccessToken(
  userId: string,
  email: string,
  role: string,
): string {
  return jwt.sign({ userId, email, role }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
}

/** Generate a valid refresh token. */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });
}

/** Generate an expired access token. */
export function generateExpiredAccessToken(
  userId: string,
  email: string,
  role: string,
): string {
  return jwt.sign({ userId, email, role }, process.env.JWT_SECRET!, {
    expiresIn: '-1s',
  });
}

/** Generate an expired refresh token. */
export function generateExpiredRefreshToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '-1s',
  });
}

// ─── Global hooks ────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});
