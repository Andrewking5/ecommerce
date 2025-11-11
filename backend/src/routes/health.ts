import { Router } from 'express';
import { prisma } from '../app';

const router = Router();

router.get('/health', async (req, res): Promise<void> => {
  const healthCheck: {
    uptime: number;
    message: string;
    timestamp: number;
    checks: {
      database: string;
      memory: string | { rss: number; heapTotal: number; heapUsed: number; external: number };
    };
  } = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: 'unknown',
      memory: 'unknown',
    },
  };

  try {
    // 檢查資料庫連線
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.checks.database = 'healthy';
  } catch (error) {
    healthCheck.checks.database = 'unhealthy';
    healthCheck.message = 'Service Unavailable';
  }

  // 檢查記憶體使用
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };

  healthCheck.checks.memory = memUsageMB;

  const statusCode = healthCheck.message === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
  return;
});

export default router;


