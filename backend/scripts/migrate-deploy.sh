#!/bin/bash
# Prisma 迁移部署脚本
# 解决 Neon 连接池超时问题

set -e

echo "🔄 Starting Prisma migration deployment..."

# 检查 DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

# 对于 Neon，如果使用连接池，迁移时需要使用直接连接
# 检查是否是 Neon 连接池 URL
if [[ "$DATABASE_URL" == *"-pooler"* ]]; then
  echo "⚠️  Detected Neon connection pooler URL"
  echo "💡 Migrations should use direct connection, not pooler"
  echo "📝 Please use direct connection URL for migrations in Render environment variables"
  echo "   Direct URL format: postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech:5432/dbname"
fi

# 设置 Prisma 迁移超时（30秒）
export PRISMA_MIGRATE_SKIP_GENERATE=1

# 重试逻辑
MAX_RETRIES=3
RETRY_COUNT=0
SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$SUCCESS" = false ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "🔄 Migration attempt $RETRY_COUNT/$MAX_RETRIES..."
  
  if npx prisma migrate deploy --skip-generate; then
    echo "✅ Migration deployed successfully"
    SUCCESS=true
  else
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "❌ Migration failed, retrying in 5 seconds..."
      sleep 5
    else
      echo "❌ Migration failed after $MAX_RETRIES attempts"
      exit 1
    fi
  fi
done

echo "✅ Migration deployment completed"

