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
    
    // 調試信息
    console.log('✅ Authentication successful:', {
      userId: user.id,
      email: user.email,
      role: userRole,
      roleType: typeof userRole,
    });
    
    next();
    return;
  } catch (error) {
    res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token' 
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
  
  // 調試信息
  console.log('🔐 Admin check:', {
    hasUser: !!authReq.user,
    userId: authReq.user?.id,
    userEmail: authReq.user?.email,
    userRole: authReq.user?.role,
    roleType: typeof authReq.user?.role,
    isAdmin: authReq.user?.role === 'ADMIN',
  });
  
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


