import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

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

  // Structured error logging
  logger.error(message, {
    statusCode,
    method: req.method,
    path: req.originalUrl,
    stack: error.stack,
    isOperational: error.isOperational,
  });

  // i18n translation for error messages
  if (req.t) {
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
      message = req.t('common:errors.internalServerError');
    } else {
      const translationKey = `common:errors.${message.toLowerCase().replace(/\s+/g, '')}`;
      const translated = req.t(translationKey);
      if (translated !== translationKey) {
        message = translated;
      }
    }
  } else {
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
