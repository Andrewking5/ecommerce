# Render 迁移超时问题 - 快速修复指南

## 🚨 问题

部署时出现错误：
```
Error: P1002
The database server was reached but timed out.
Timed out trying to acquire a postgres advisory lock (SELECT pg_advisory_lock(...)). Elapsed: 10000ms.
```

## ✅ 快速解决方案（5分钟）

### 步骤 1：获取直接连接 URL

1. 登录 [Neon Console](https://console.neon.tech)
2. 选择你的数据库项目
3. 在 "Connection Details" 中找到 **"Direct connection"** 或 **"Connection string"**
4. 复制 URL（**不要使用包含 `-pooler` 的 URL**）

**示例：**
- ❌ 错误（连接池）：`postgresql://user:pass@ep-xxx-xxx-pooler.region.aws.neon.tech:5432/dbname`
- ✅ 正确（直接连接）：`postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech:5432/dbname`

### 步骤 2：在 Render 中设置环境变量

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 选择你的 Web Service
3. 点击 **"Environment"** 标签
4. 点击 **"Add Environment Variable"**
5. 设置：
   - **Key**: `DIRECT_DATABASE_URL`
   - **Value**: 粘贴从 Neon 获取的直接连接 URL
6. 点击 **"Save Changes"**

### 步骤 3：重新部署

1. 在 Render Dashboard 中，点击 **"Manual Deploy"** → **"Deploy latest commit"**
2. 等待部署完成
3. 查看日志确认迁移成功

## 📋 验证

部署完成后，在日志中应该看到：
```
✅ Using DIRECT_DATABASE_URL for migration
🔄 Migration attempt 1/3...
✅ Migration deployed successfully
```

## 🔍 如果仍然失败

1. **检查环境变量是否正确设置**
   - 在 Render Shell 中运行：`echo $DIRECT_DATABASE_URL`
   - 确认 URL 不包含 `-pooler`

2. **检查数据库连接**
   - 在 Render Shell 中运行：
     ```bash
     cd backend
     npx prisma db pull
     ```

3. **查看详细文档**
   - 参考 `backend/RENDER_DEPLOY.md` 获取完整的故障排除指南

## 💡 为什么需要直接连接？

- **连接池（Pooler）**：适合应用运行时，但迁移操作可能超时
- **直接连接（Direct）**：适合迁移操作，更稳定可靠

迁移脚本会自动检测 `DIRECT_DATABASE_URL`，如果存在就使用它进行迁移。

## 📚 更多信息

- 完整文档：`backend/RENDER_DEPLOY.md`
- 迁移脚本：`backend/scripts/migrate-deploy.js`



