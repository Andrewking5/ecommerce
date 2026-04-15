#!/usr/bin/env node
/**
 * Prisma 迁移部署脚本（Node.js 版本）
 * 解决 Neon 连接池超时问题，自動處理 P3009 failed migration
 */

const { execSync } = require('child_process');

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5秒

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * If migrate deploy fails with P3009, extract the failed migration name
 * from the error message and mark it as rolled-back, then return true
 * so the caller can retry.
 *
 * Error message format from Prisma:
 *   The `20260415000000_add_event_metadata` migration started at ... failed
 */
function tryResolveP3009(errorOutput) {
  if (!errorOutput.includes('P3009') && !errorOutput.includes('failed migrations')) {
    return false;
  }

  // Extract migration name from: The `<name>` migration started at ...
  const match = /The `([\w]+)` migration/.exec(errorOutput);
  if (!match) {
    console.warn('⚠️  P3009 detected but could not extract migration name');
    return false;
  }

  const name = match[1];
  console.log(`⚠️  P3009: resolving failed migration "${name}"...`);
  try {
    execSync(`npx prisma migrate resolve --rolled-back "${name}"`, {
      stdio: 'inherit',
      env: process.env,
      timeout: 30000,
    });
    console.log(`✅ Marked "${name}" as rolled-back`);
    return true;
  } catch (resolveErr) {
    console.warn(`⚠️  Could not resolve "${name}": ${resolveErr.message}`);
    return false;
  }
}

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  // 如果有 DIRECT_DATABASE_URL，优先使用它（用于迁移）
  if (process.env.DIRECT_DATABASE_URL) {
    console.log('✅ Using DIRECT_DATABASE_URL for migration');
    process.env.DATABASE_URL = process.env.DIRECT_DATABASE_URL;
  } else {
    console.log('ℹ️  Using DATABASE_URL for migration');
  }

  let retryCount = 0;
  let success = false;

  while (retryCount < MAX_RETRIES && !success) {
    retryCount++;
    console.log(`🔄 Migration attempt ${retryCount}/${MAX_RETRIES}...`);

    try {
      const out = execSync('npx prisma migrate deploy', {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
        timeout: 120000,
      });
      if (out) process.stdout.write(out);
      console.log('✅ Migration deployed successfully');
      success = true;
    } catch (error) {
      if (error.stdout) process.stdout.write(error.stdout);
      if (error.stderr) process.stderr.write(error.stderr);
      const errorOutput = (error.stdout ? error.stdout.toString() : '') + (error.stderr ? error.stderr.toString() : '');

      // P3009: failed migration in DB — resolve and retry immediately (don't count as a retry)
      if (tryResolveP3009(errorOutput)) {
        retryCount--; // don't consume a retry slot
        continue;
      }

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
