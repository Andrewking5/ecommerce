// 立即輸出日誌，確保能看到任何輸出
console.log('📦 Loading server module...');
console.log('📦 Node version:', process.version);
console.log('📦 Working directory:', process.cwd());

let app: any;
let prisma: any;

// 使用 try-catch 包裝導入，防止導入錯誤導致無聲失敗
try {
  console.log('📦 Importing app module...');
  const appModule = require('./app');
  app = appModule.default;
  prisma = appModule.prisma;
  console.log('✅ App module imported successfully');
} catch (error: any) {
  console.error('❌ Failed to import app module:');
  console.error('  Error message:', error?.message || 'Unknown error');
  console.error('  Error stack:', error?.stack || 'No stack trace');
  console.error('  Error code:', error?.code || 'N/A');
  process.exit(1);
}

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

    // 運行數據庫遷移（生產環境）
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 Running database migrations...');
      try {
        const { execSync } = require('child_process');
        execSync('npx prisma migrate deploy', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log('✅ Database migrations completed');
      } catch (error: any) {
        console.warn('⚠️  Database migration warning:', error?.message || error);
        // 不阻止服務器啟動，因為遷移可能已經運行過
      }
    }

    // 啟動伺服器
    console.log('🔍 Starting HTTP server...');
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API URL: http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // 處理伺服器錯誤
    if (server) {
      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${PORT} is already in use. Please free the port or use a different port.`);
          process.exit(1);
        } else {
          console.error('❌ Server error:', error);
          process.exit(1);
        }
      });
    }
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
  
  if (server !== null) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
  
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// 捕獲未處理的異常
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:');
  console.error('  Error message:', error.message);
  console.error('  Error stack:', error.stack);
  process.exit(1);
});

// 捕獲未處理的 Promise 拒絕
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('  Reason:', reason);
  process.exit(1);
});

// 啟動服務器
console.log('📦 Starting server...');
startServer().catch((error: any) => {
  console.error('❌ startServer() failed:');
  console.error('  Error message:', error?.message || 'Unknown error');
  console.error('  Error stack:', error?.stack || 'No stack trace');
  process.exit(1);
});


