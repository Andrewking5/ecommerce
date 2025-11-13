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

    // 測試資料庫連線（添加超時和重試）
    console.log('🔍 Connecting to database...');
    const maxRetries = 3;
    let retryCount = 0;
    let connected = false;

    while (retryCount < maxRetries && !connected) {
      try {
        await Promise.race([
          prisma.$connect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout after 10s')), 10000)
          )
        ]);
        console.log('✅ Database connected successfully');
        connected = true;
      } catch (error: any) {
        retryCount++;
        console.error(`❌ Database connection attempt ${retryCount}/${maxRetries} failed:`, error.message);
        
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error('❌ All database connection attempts failed');
          console.error('⚠️  Server will continue to start, but database operations may fail');
          console.error('💡 Please check:');
          console.error('   1. DATABASE_URL environment variable is set correctly');
          console.error('   2. Database service is running and accessible');
          console.error('   3. DATABASE_URL includes connection pool parameters if needed');
          // 不阻止服務器啟動，讓它繼續運行
        }
      }
    }

    // 運行數據庫遷移（生產環境）
    // 注意：在 Render 上，迁移应该在构建阶段完成（在 build command 中）
    // 这里只在明确设置 RUN_MIGRATIONS_ON_START=true 时才运行
    if (process.env.NODE_ENV === 'production' && process.env.RUN_MIGRATIONS_ON_START === 'true') {
      console.log('🔍 Running database migrations at startup...');
      Promise.resolve().then(async () => {
        try {
          const { execSync } = require('child_process');
          // 使用迁移脚本，它有重试逻辑和更好的错误处理
          execSync('node scripts/migrate-deploy.js', { 
            stdio: 'inherit',
            cwd: process.cwd(),
            env: { ...process.env },
            timeout: 120000, // 120秒超時（迁移可能需要更长时间）
          });
          console.log('✅ Database migrations completed');
        } catch (error: any) {
          console.warn('⚠️  Database migration warning:', error?.message || error);
          console.warn('⚠️  This is usually safe - migrations may have already been applied');
          console.warn('💡 Recommended: Run migrations in Render build command instead of at runtime');
        }
      }).catch(() => {
        // 靜默處理錯誤，不影響服務器啟動
      });
    } else if (process.env.NODE_ENV === 'production') {
      console.log('ℹ️  Skipping runtime migrations (should be done in build phase)');
      console.log('💡 To run migrations at startup, set RUN_MIGRATIONS_ON_START=true');
    }

    // 創建初始管理員（如果環境變量已設置）- 在後台運行
    Promise.resolve().then(async () => {
      try {
        const { createInitialAdminIfNeeded } = require('./utils/createInitialAdmin');
        await createInitialAdminIfNeeded();
      } catch (error: any) {
        console.warn('⚠️  Failed to create initial admin:', error?.message || error);
        // 不阻止服務器啟動
      }
    });

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
  
  // 如果是 Cloudinary 错误，不退出服务，只记录错误
  if (reason?.http_code === 401 || reason?.message?.includes('Invalid api_key') || reason?.message?.includes('Cloudinary')) {
    console.error('⚠️  Cloudinary error detected. Service will continue running.');
    console.error('⚠️  Please check CLOUDINARY environment variables.');
    return; // 不退出服务
  }
  
  // 其他未处理的拒绝，在开发环境不退出，生产环境退出
  if (process.env.NODE_ENV === 'development') {
    console.error('⚠️  Unhandled rejection in development mode. Service will continue running.');
    return;
  }
  
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


