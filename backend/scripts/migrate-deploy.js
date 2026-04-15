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

/**
 * Detect Prisma P3009 (failed migration in DB) and mark each failed
 * migration as rolled-back so migrate deploy can re-run it.
 * Safe because all our migration SQL uses IF NOT EXISTS.
 */
function resolveFailedMigrations() {
  let output = '';
  try {
    execSync('npx prisma migrate status', {
      env: process.env,
      timeout: 30000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    output = (err.stdout || '').toString() + (err.stderr || '').toString();
  }

  if (!output.includes('failed')) return;

  // Extract migration names from lines like:
  //   • 20260415000000_add_event_metadata   (failed)
  const failedPattern = /[•*]\s+([\w]+)\s+.*failed/g;
  let match;
  while ((match = failedPattern.exec(output)) !== null) {
    const name = match[1];
    console.log(`⚠️  Resolving failed migration: ${name}`);
    try {
      execSync(`npx prisma migrate resolve --rolled-back "${name}"`, {
        stdio: 'inherit',
        env: process.env,
        timeout: 30000,
      });
      console.log(`✅ Marked ${name} as rolled-back`);
    } catch (resolveErr) {
      console.warn(`⚠️  Could not resolve ${name}: ${resolveErr.message}`);
    }
  }
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

  // P3009: resolve any previously failed migrations before deploying.
  // This happens when a past deploy ran the SQL partially then crashed.
  // Since our migration SQL is idempotent (uses IF NOT EXISTS), it is
  // safe to mark it as rolled-back so Prisma will re-run it cleanly.
  resolveFailedMigrations();

  let retryCount = 0;
  let success = false;

  while (retryCount < MAX_RETRIES && !success) {
    retryCount++;
    console.log(`🔄 Migration attempt ${retryCount}/${MAX_RETRIES}...`);

    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: process.env,
        timeout: 120000,
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

