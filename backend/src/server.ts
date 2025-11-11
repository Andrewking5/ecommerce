import app from './app';
import { prisma } from './app';
import { Server } from 'http';

const PORT = process.env.PORT || 3001;

let server: Server | null = null;

async function startServer() {
  try {
    console.log('🔍 Starting server...');
    console.log('🔍 Environment variables check:');
    console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('  - JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '✅ Set' : '❌ Missing');
    console.log('  - NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('  - PORT:', process.env.PORT || 3001);

    // 測試資料庫連線
    console.log('🔍 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 啟動伺服器
    console.log('🔍 Starting HTTP server...');
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
  } catch (error: any) {
    console.error('❌ Failed to start server:');
    console.error('  Error message:', error?.message || 'Unknown error');
    console.error('  Error stack:', error?.stack || 'No stack trace');
    if (error?.code) {
      console.error('  Error code:', error.code);
    }
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


