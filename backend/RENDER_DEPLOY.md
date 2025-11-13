# Render 部署配置指南

## 数据库迁移超时问题解决方案

### 问题
在 Render 部署时，`prisma migrate deploy` 可能会因为 Neon 连接池超时而失败。

### 解决方案

#### 方案 1：使用直接连接 URL（推荐）

1. 在 Render 环境变量中添加 `DIRECT_DATABASE_URL`：
   - 从 Neon 控制台获取**直接连接 URL**（不是连接池 URL）
   - 直接连接 URL 格式：`postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech:5432/dbname`
   - 连接池 URL 格式：`postgresql://user:pass@ep-xxx-xxx-pooler.region.aws.neon.tech:5432/dbname`

2. 迁移脚本会自动检测并使用 `DIRECT_DATABASE_URL`（如果存在）

#### 方案 2：修改 DATABASE_URL

如果无法使用直接连接，可以在 `DATABASE_URL` 中添加连接参数：

```
postgresql://user:pass@host:5432/dbname?connection_limit=1&pool_timeout=30&connect_timeout=30
```

#### 方案 3：在 Render 构建命令中

Render 的构建命令应该使用：
```bash
npm run db:deploy && npm start
```

或者直接使用：
```bash
node scripts/migrate-deploy.js && npm start
```

### 环境变量配置

在 Render Dashboard 中设置：

1. **DATABASE_URL**（必需）
   - 用于应用运行时的数据库连接
   - 可以使用连接池 URL

2. **DIRECT_DATABASE_URL**（可选，推荐）
   - 用于迁移的数据库连接
   - 必须使用直接连接 URL（不是连接池）

### 连接池 vs 直接连接

- **连接池（Pooler）**：
  - 优点：更好的性能，支持更多并发连接
  - 缺点：迁移操作可能超时
  - 适用于：应用运行时连接

- **直接连接（Direct）**：
  - 优点：迁移操作更稳定
  - 缺点：连接数有限
  - 适用于：迁移操作

### 故障排除

如果迁移仍然失败：

1. 检查数据库是否可访问
2. 确认 DATABASE_URL 格式正确
3. 检查是否有其他迁移正在运行
4. 查看 Render 日志获取详细错误信息
5. 尝试手动运行迁移：`npx prisma migrate deploy`

