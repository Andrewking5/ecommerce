import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Intercept response finish to log with duration + status
  res.on('finish', () => {
    const duration = Date.now() - start;
    const path = req.originalUrl || req.url;
    const meta = {
      method: req.method,
      path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')?.substring(0, 80),
    };

    if (res.statusCode >= 500) {
      logger.error(`${req.method} ${path} ${res.statusCode} ${duration}ms`, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${path} ${res.statusCode} ${duration}ms`, meta);
    } else {
      logger.http(`${req.method} ${path} ${res.statusCode} ${duration}ms`, meta);
    }
  });

  next();
  return;
};
