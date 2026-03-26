import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ 
      success: false,
      message: 'Access token required' 
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // 檢查用戶是否仍然存在且活躍
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      res.status(403).json({ 
        success: false,
        message: 'User not found or inactive' 
      });
      return;
    }

    // 確保 role 是字符串類型
    const userRole = String(user.role);

    authReq.user = {
      id: user.id,
      email: user.email,
      role: userRole,
    };
    
    next();
    return;
  } catch (error: any) {
    console.error('❌ Token verification failed:', {
      path: req.path,
      error: error?.message || error,
      errorName: error?.name,
    });
    
    // Token 过期或无效应该返回 401，让前端可以尝试刷新 token
    // 403 应该用于权限不足的情况
    const isTokenExpired = error?.name === 'TokenExpiredError' || error?.name === 'JsonWebTokenError';
    const statusCode = isTokenExpired ? 401 : 403;
    
    res.status(statusCode).json({ 
      success: false,
      message: isTokenExpired ? 'Token expired or invalid' : 'Invalid token',
      code: isTokenExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
    });
    return;
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;
  
  if (!authReq.user) {
    res.status(403).json({ 
      success: false,
      message: 'Authentication required' 
    });
    return;
  }
  
  // 檢查角色（支持字符串和枚舉類型）
  const userRole = String(authReq.user.role).toUpperCase();
  
  if (userRole !== 'ADMIN') {
    res.status(403).json({ 
      success: false,
      message: `Admin access required. Current role: ${userRole}` 
    });
    return;
  }
  
  next();
  return;
};


