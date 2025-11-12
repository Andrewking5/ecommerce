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
): void => {
  let { statusCode = 500, message } = error;

  // 記錄錯誤
  console.error(`Error ${statusCode}: ${message}`);
  console.error(error.stack);

  // 使用 i18n 翻譯錯誤訊息
  if (req.t) {
    // 生產環境不暴露詳細錯誤
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
      message = req.t('common:errors.internalServerError');
    } else {
      // 嘗試翻譯錯誤訊息（如果翻譯鍵存在）
      const translationKey = `common:errors.${message.toLowerCase().replace(/\s+/g, '')}`;
      const translated = req.t(translationKey);
      // 如果翻譯存在且不是鍵名本身，使用翻譯
      if (translated !== translationKey) {
        message = translated;
      }
    }
  } else {
    // 如果沒有 i18n，使用預設訊息
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
      message = 'Internal server error';
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
  const error = new Error(
    req.t ? req.t('common:errors.notFound') : `Not found - ${req.originalUrl}`
  ) as AppError;
  error.statusCode = 404;
  next(error);
  return;
};


