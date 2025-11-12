import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // 記錄請求開始（使用 originalUrl 獲取完整路徑）
  const requestPath = req.originalUrl || req.url;
  console.log(`📥 ${req.method} ${requestPath} - ${req.ip}`);
  
  // 攔截回應結束事件
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const responsePath = req.originalUrl || req.url;
    
    console.log(`📤 ${req.method} ${responsePath} - ${res.statusCode} - ${duration}ms`);
    
    return originalSend.call(this, data);
  };

  next();
  return;
};


