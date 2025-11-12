import { Request, Response, NextFunction } from 'express';
import { t } from '../utils/i18n';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  translationKey?: string;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message, translationKey } = error;

  // 記錄錯誤
  console.error(`Error ${statusCode}: ${message}`);
  console.error(error.stack);

  // 如果有翻譯鍵，使用翻譯
  if (translationKey) {
    message = t(req, translationKey, message);
  } else {
    // 根據狀態碼使用默認翻譯
    switch (statusCode) {
      case 400:
        message = t(req, 'errors.validation', message);
        break;
      case 401:
        message = t(req, 'errors.unauthorized', message);
        break;
      case 403:
        message = t(req, 'errors.forbidden', message);
        break;
      case 404:
        message = t(req, 'errors.notFound', message);
        break;
      case 500:
      default:
        // 生產環境不暴露詳細錯誤
        if (process.env.NODE_ENV === 'production') {
          message = t(req, 'errors.internal', 'Internal server error');
        }
        break;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
  return;
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not found - ${req.originalUrl}`) as AppError;
  error.statusCode = 404;
  next(error);
  return;
};


