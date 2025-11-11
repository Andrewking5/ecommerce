import app from './app';
import { prisma } from './app';
import { Server } from 'http';

const PORT = process.env.PORT || 3001;

let server: Server | null = null;

async function startServer() {
  try {
    // 測試資料庫連線
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 啟動伺服器
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API URL: http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // 處理伺服器錯誤
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please free the port or use a different port.`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// 優雅關閉
async function shutdown() {
  console.log('Shutting down gracefully...');
  
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
  
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();


