import { Response } from 'express';
import { Prisma } from '@prisma/client';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  meta?: any;
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
  meta?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    meta?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.meta = meta;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 处理 Prisma 错误
 */
export function handlePrismaError(error: any): AppError {
  // Prisma 唯一约束违反
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    return new AppError(
      `Duplicate entry: ${field} already exists`,
      400,
      'DUPLICATE_ENTRY',
      true,
      error.meta
    );
  }

  // Prisma 记录未找到
  if (error.code === 'P2025') {
    return new AppError(
      'Record not found',
      404,
      'RECORD_NOT_FOUND',
      true
    );
  }

  // Prisma 外键约束违反
  if (error.code === 'P2003') {
    return new AppError(
      'Foreign key constraint violation',
      400,
      'FOREIGN_KEY_VIOLATION',
      true,
      error.meta
    );
  }

  // Prisma 查询引擎错误
  if (error.code === 'P2001') {
    return new AppError(
      'Record does not exist',
      404,
      'RECORD_NOT_FOUND',
      true
    );
  }

  // Prisma 查询错误（可能是字段不存在或表不存在）
  if (
    error.code === 'P2010' || 
    error.code === 'P2021' || // Table does not exist
    error.code === 'P2022' || // Column does not exist
    error.message?.includes('Unknown column') || 
    error.message?.includes('does not exist') ||
    error.message?.includes('relation') && error.message?.includes('does not exist')
  ) {
    return new AppError(
      'Database schema mismatch. Please run database migrations: npm run db:deploy',
      500,
      'SCHEMA_MISMATCH',
      false,
      { 
        originalError: error.message,
        code: error.code,
        hint: 'Run migrations in Render Shell: cd backend && npm run db:deploy'
      }
    );
  }

  // 默认 Prisma 错误
  return new AppError(
    error.message || 'Database error',
    500,
    'DATABASE_ERROR',
    false,
    error.meta
  );
}

/**
 * 处理 JWT 错误
 */
export function handleJWTError(error: any): AppError {
  if (error.name === 'TokenExpiredError') {
    return new AppError(
      'Token expired',
      401,
      'TOKEN_EXPIRED',
      true
    );
  }

  if (error.name === 'JsonWebTokenError') {
    return new AppError(
      'Invalid token',
      401,
      'TOKEN_INVALID',
      true
    );
  }

  return new AppError(
    'Authentication error',
    401,
    'AUTH_ERROR',
    true
  );
}

/**
 * 统一错误响应格式
 */
export function sendErrorResponse(
  res: Response,
  error: AppError | Error,
  req?: any
): void {
  let appError: AppError;

  // 如果是 AppError，直接使用
  if (error instanceof AppError) {
    appError = error;
  }
  // 如果是 Prisma 错误，转换
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(error);
  }
  // 如果是 JWT 错误，转换
  else if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
    appError = handleJWTError(error);
  }
  // 其他错误，包装为 AppError
  else {
    appError = new AppError(
      error.message || 'Internal server error',
      500,
      'INTERNAL_ERROR',
      false
    );
  }

  // 记录错误（生产环境只记录非操作错误）
  if (!appError.isOperational || process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      stack: process.env.NODE_ENV === 'development' ? appError.stack : undefined,
      meta: appError.meta,
    });
  }

  // 发送错误响应
  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    code: appError.code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: appError.stack,
      meta: appError.meta,
    }),
  });
}

/**
 * 异步错误处理包装器
 */
export function asyncHandler(
  fn: (req: any, res: Response, next: any) => Promise<any>
) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      sendErrorResponse(res, error, req);
    });
  };
}

