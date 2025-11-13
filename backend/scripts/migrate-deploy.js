#!/usr/bin/env node
/**
 * Prisma 迁移部署脚本（Node.js 版本）
 * 解决 Neon 连接池超时问题
 */

const { execSync } = require('child_process');

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5秒

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  // 如果有 DIRECT_DATABASE_URL，优先使用它（用于迁移）
  // 否则直接使用 DATABASE_URL（Prisma 5.x 可以处理 pooler URL）
  if (process.env.DIRECT_DATABASE_URL) {
    console.log('✅ Using DIRECT_DATABASE_URL for migration');
    process.env.DATABASE_URL = process.env.DIRECT_DATABASE_URL;
  } else {
    console.log('ℹ️  Using DATABASE_URL for migration (Prisma 5.x supports pooler URLs)');
  }

  // Prisma 5.22.0+ 不再需要 PRISMA_MIGRATE_SKIP_GENERATE
  // 因为我们在构建阶段已经运行了 prisma generate

  let retryCount = 0;
  let success = false;

  while (retryCount < MAX_RETRIES && !success) {
    retryCount++;
    console.log(`🔄 Migration attempt ${retryCount}/${MAX_RETRIES}...`);

    try {
      // Prisma 5.22.0+ 不再支持 --skip-generate，因为我们已经运行了 prisma generate
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: process.env,
        timeout: 120000, // 120秒超时（迁移可能需要更长时间）
      });
      console.log('✅ Migration deployed successfully');
      success = true;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.error(`❌ Migration failed: ${error.message}`);
        console.log(`🔄 Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
      } else {
        console.error(`❌ Migration failed after ${MAX_RETRIES} attempts`);
        console.warn('⚠️  Migration will be skipped. You can run it manually later.');
        // 在构建阶段，不退出进程，让构建继续
        if (process.env.SKIP_MIGRATION_ON_ERROR === 'true') {
          console.log('ℹ️  SKIP_MIGRATION_ON_ERROR=true, continuing build...');
          process.exit(0);
        }
        process.exit(1);
      }
    }
  }

  console.log('✅ Migration deployment completed');
}

runMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

