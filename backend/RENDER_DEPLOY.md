# Render 部署配置指南

## 数据库迁移超时问题解决方案

### 问题
在 Render 部署时，`prisma migrate deploy` 可能会因为 Neon 连接池超时而失败。

错误信息示例：
```
Error: P1002
The database server was reached but timed out.
Timed out trying to acquire a postgres advisory lock (SELECT pg_advisory_lock(...)). Elapsed: 10000ms.
```

### 根本原因
Neon 的连接池器（pooler）在处理长时间运行的迁移操作时可能会超时，特别是在获取 PostgreSQL 咨询锁时。

### 解决方案（按推荐顺序）

#### ✅ 方案 1：使用直接连接 URL（强烈推荐）

**步骤：**

1. **获取直接连接 URL**
   - 登录 [Neon Console](https://console.neon.tech)
   - 选择你的数据库项目
   - 在 "Connection Details" 中找到 **"Direct connection"** 或 **"Connection string"**
   - 直接连接 URL 格式：`postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech:5432/dbname?sslmode=require`
   - ⚠️ **注意**：不要使用包含 `-pooler` 的 URL

2. **在 Render 中设置环境变量**
   - 登录 [Render Dashboard](https://dashboard.render.com)
   - 选择你的 Web Service
   - 点击 **"Environment"** 标签
   - 添加新的环境变量：
     - **Key**: `DIRECT_DATABASE_URL`
     - **Value**: 你的直接连接 URL（从 Neon 获取）
   - 点击 **"Save Changes"**

3. **验证配置**
   - 迁移脚本会自动检测并使用 `DIRECT_DATABASE_URL`（如果存在）
   - 重新部署服务，查看日志确认迁移成功

**为什么有效：**
- 直接连接不使用连接池，避免了连接池的超时限制
- 迁移操作可以获取并持有数据库锁，不会超时

#### 方案 2：修改 Build Command（如果无法使用直接连接）

如果无法获取直接连接 URL，可以修改 Render 的 Build Command：

1. 在 Render Dashboard 中，选择你的 Web Service
2. 点击 **"Settings"** 标签
3. 找到 **"Build Command"**
4. 更新为：
   ```bash
   cd backend && npm install && npm run build && node scripts/migrate-deploy.js && npm start
   ```

5. 或者使用带重试的版本：
   ```bash
   cd backend && npm install && npm run build && (node scripts/migrate-deploy.js || echo 'Migration failed, continuing...') && npm start
   ```

**注意**：这种方法仍然可能遇到超时问题，建议优先使用方案 1。

#### 方案 3：在 Start Command 中运行迁移（不推荐）

如果迁移在构建阶段失败，可以尝试在启动时运行：

1. 在 Render Dashboard 中设置环境变量：
   - **Key**: `RUN_MIGRATIONS_ON_START`
   - **Value**: `true`

2. 修改 **Start Command** 为：
   ```bash
   cd backend && (node scripts/migrate-deploy.js || true) && npm start
   ```

**⚠️ 警告**：这种方法可能导致应用启动延迟，且如果迁移失败，应用仍会启动（可能导致运行时错误）。

### 环境变量配置清单

在 Render Dashboard 的 **Environment** 标签中设置：

| 环境变量 | 必需 | 说明 | 示例 |
|---------|------|------|------|
| `DATABASE_URL` | ✅ 是 | 应用运行时连接（可使用连接池 URL） | `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech:5432/dbname?sslmode=require` |
| `DIRECT_DATABASE_URL` | ⭐ 强烈推荐 | 迁移时连接（必须使用直接连接 URL） | `postgresql://user:pass@ep-xxx.region.aws.neon.tech:5432/dbname?sslmode=require` |
| `RUN_MIGRATIONS_ON_START` | 可选 | 是否在启动时运行迁移 | `true` 或 `false` |
| `SKIP_MIGRATION_ON_ERROR` | 可选 | 迁移失败时是否继续构建 | `true` 或 `false` |

### 连接池 vs 直接连接

| 特性 | 连接池（Pooler） | 直接连接（Direct） |
|------|----------------|-------------------|
| URL 特征 | 包含 `-pooler` | 不包含 `-pooler` |
| 性能 | 更好的性能，支持更多并发 | 连接数有限 |
| 迁移操作 | ❌ 可能超时 | ✅ 稳定可靠 |
| 应用运行时 | ✅ 推荐使用 | ⚠️ 连接数有限 |
| 适用场景 | 生产环境应用连接 | 迁移操作 |

### 如何区分连接池 URL 和直接连接 URL

**连接池 URL（Pooler）**：
```
postgresql://user:pass@ep-withered-moon-a1v63stz-pooler.ap-southeast-1.aws.neon.tech:5432/neondb
                                                      ^^^^^^
                                                      包含 -pooler
```

**直接连接 URL（Direct）**：
```
postgresql://user:pass@ep-withered-moon-a1v63stz.ap-southeast-1.aws.neon.tech:5432/neondb
                                                      ^
                                                      不包含 -pooler
```

### 故障排除步骤

如果迁移仍然失败，按以下步骤排查：

1. **检查环境变量**
   ```bash
   # 在 Render Shell 中运行
   echo $DATABASE_URL
   echo $DIRECT_DATABASE_URL
   ```
   - 确认 `DIRECT_DATABASE_URL` 已设置
   - 确认 `DIRECT_DATABASE_URL` 不包含 `-pooler`

2. **检查数据库连接**
   ```bash
   # 在 Render Shell 中运行
   cd backend
   npx prisma db pull --schema=prisma/schema.prisma
   ```
   - 如果连接失败，检查 URL 是否正确
   - 检查数据库是否允许来自 Render 的连接

3. **手动运行迁移**
   ```bash
   # 在 Render Shell 中运行
   cd backend
   node scripts/migrate-deploy.js
   ```
   - 查看详细错误信息
   - 确认迁移脚本是否正常工作

4. **检查是否有其他迁移正在运行**
   - 如果有其他进程正在运行迁移，会锁定数据库
   - 等待其他迁移完成后再试

5. **查看 Render 日志**
   - 在 Render Dashboard 中查看实时日志
   - 查找具体的错误信息
   - 检查超时时间设置

6. **联系支持**
   - 如果以上步骤都无法解决，可能是 Neon 数据库的问题
   - 检查 Neon 控制台中的数据库状态
   - 查看 Neon 的文档或联系支持

### 推荐的 Render 配置

**Build Command:**
```bash
cd backend && npm install && npm run build && node scripts/migrate-deploy.js
```

**Start Command:**
```bash
cd backend && npm start
```

**环境变量:**
- `DATABASE_URL`: 连接池 URL（用于应用运行时）
- `DIRECT_DATABASE_URL`: 直接连接 URL（用于迁移）⭐ **必需**

### 常见错误和解决方案

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `P1002: Timed out` | 使用连接池 URL 进行迁移 | 设置 `DIRECT_DATABASE_URL` |
| `P1001: Can't reach database` | 数据库 URL 错误或网络问题 | 检查 URL 格式和网络连接 |
| `P1017: Server has closed the connection` | 连接被服务器关闭 | 使用直接连接 URL |
| `Migration failed after 3 attempts` | 多次重试后仍失败 | 检查数据库状态和网络连接 |

### 最佳实践

1. ✅ **始终使用 `DIRECT_DATABASE_URL` 进行迁移**
2. ✅ **使用连接池 URL 作为 `DATABASE_URL`（应用运行时）**
3. ✅ **在构建阶段运行迁移，而不是启动阶段**
4. ✅ **定期检查迁移状态和数据库连接**
5. ❌ **不要在代码中硬编码数据库 URL**
6. ❌ **不要在生产环境跳过迁移检查**

