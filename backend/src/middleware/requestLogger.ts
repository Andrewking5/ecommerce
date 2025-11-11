import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // 記錄請求開始
  console.log(`📥 ${req.method} ${req.url} - ${req.ip}`);
  
  // 攔截回應結束事件
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    console.log(`📤 ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    
    return originalSend.call(this, data);
  };

  next();
  return;
};


