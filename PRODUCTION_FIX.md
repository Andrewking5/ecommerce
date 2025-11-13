# 生产环境修复指南

## 问题诊断

生产环境出现 500 错误的主要原因是：

1. **数据库 Schema 不同步**：生产环境数据库缺少 `displayOrder` 字段
2. **代码使用了新字段但数据库未更新**：查询时尝试使用 `displayOrder` 排序导致错误

## 已修复的问题

### 1. 代码向后兼容性修复

- ✅ 移除了 `variantController.ts` 中的 `displayOrder` 排序（临时修复）
- ✅ 移除了 `attributeController.ts` 中的 `displayOrder` 排序（临时修复）
- ✅ 改进了错误处理，提供更清晰的错误信息
- ✅ 添加了 Prisma schema 不匹配的错误检测

### 2. 错误处理改进

- ✅ 添加了 `SCHEMA_MISMATCH` 错误代码
- ✅ 改进了 `inventoryController` 的错误响应
- ✅ 改进了 `productController` 的 Prisma 错误处理

## 需要执行的步骤

### 步骤 1: 在 Render 上运行数据库迁移

**方法 1: 通过 Render Shell（推荐）**

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 选择你的 Web Service（`ecommerce-1w9j`）
3. 点击 **"Shell"** 标签
4. 运行以下命令：

```bash
cd backend
npm run db:deploy
```

**方法 2: 通过环境变量自动迁移**

1. 在 Render Dashboard 中，选择你的 Web Service
2. 点击 **"Environment"** 标签
3. 添加环境变量：
   - Key: `RUN_MIGRATIONS_ON_START`
   - Value: `true`
4. 点击 **"Save Changes"**（会自动重新部署）

**方法 3: 更新 Build Command（推荐用于生产环境）**

1. 在 Render Dashboard 中，选择你的 Web Service
2. 点击 **"Settings"** 标签
3. 找到 **"Build Command"**
4. 更新为：

```bash
cd backend && npm install && npm run build && npm run db:deploy
```

### 步骤 2: 验证迁移

迁移完成后，检查：

1. 访问 `https://ecommerce-1w9j.onrender.com/api/health`
2. 检查 Render 日志，确认没有数据库错误
3. 测试产品列表 API：`https://ecommerce-1w9j.onrender.com/api/products?page=1&limit=8`

### 步骤 3: 恢复完整功能（迁移完成后）

迁移完成后，可以恢复使用 `displayOrder` 字段：

1. 恢复 `variantController.ts` 中的 `displayOrder` 排序
2. 恢复 `attributeController.ts` 中的 `displayOrder` 排序

## 401 错误处理

401 错误通常是认证问题，已通过以下方式处理：

- ✅ Token 自动刷新机制
- ✅ 改进的错误日志

如果持续出现 401 错误，检查：

1. JWT_SECRET 和 JWT_REFRESH_SECRET 环境变量是否正确设置
2. Token 是否过期
3. 前端是否正确发送 Authorization header

## 验证修复

修复后，以下 API 应该正常工作：

- ✅ `GET /api/products` - 产品列表
- ✅ `GET /api/products/:id` - 产品详情
- ✅ `GET /api/admin/inventory/low-stock` - 低库存产品
- ✅ `GET /api/users` - 用户列表（需要认证）
- ✅ `GET /api/orders/admin/all` - 订单列表（需要认证）

## 注意事项

1. **数据库迁移是破坏性操作**：确保在生产环境运行迁移前备份数据库
2. **迁移时间**：根据数据量，迁移可能需要几分钟
3. **零停机迁移**：`displayOrder` 字段有默认值，不会影响现有数据

## 后续优化

迁移完成后，建议：

1. 恢复 `displayOrder` 字段的使用
2. 添加数据库迁移监控
3. 设置自动迁移检查

