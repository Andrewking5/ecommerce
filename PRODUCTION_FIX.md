# 生产环境修复指南

## 问题诊断

生产环境出现 500 错误的主要原因是：

1. **数据库 Schema 不同步**：生产环境数据库缺少 `displayOrder` 字段
2. **代码使用了新字段但数据库未更新**：查询时尝试使用 `displayOrder` 排序导致错误

## 构建错误修复

### 问题
- ❌ `--skip-generate` 选项在 Prisma 5.22.0+ 中不被支持
- ❌ 迁移在构建阶段失败导致整个构建失败
- ❌ 数据库连接超时（Neon 连接池问题）

### 解决方案
- ✅ 移除了 `--skip-generate` 选项（Prisma 5.22.0+ 不再需要）
- ✅ 改进了迁移脚本的错误处理
- ✅ 将迁移从构建阶段移除，改为在启动时运行
- ✅ 更新了构建命令，不再在构建时运行迁移

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

**方法 2: 通过环境变量自动迁移（推荐用于生产环境）**

1. 在 Render Dashboard 中，选择你的 Web Service
2. 点击 **"Environment"** 标签
3. 添加环境变量：
   - Key: `RUN_MIGRATIONS_ON_START`
   - Value: `true`
4. 点击 **"Save Changes"**（会自动重新部署）
5. **重要**：部署完成后，检查日志确认迁移已运行

**注意**：如果数据库连接有问题，迁移可能会失败。建议先使用方法 1 手动运行一次，确认迁移成功后再使用方法 2。

**方法 3: 更新 Build Command（推荐用于生产环境）**

1. 在 Render Dashboard 中，选择你的 Web Service
2. 点击 **"Settings"** 标签
3. 找到 **"Build Command"**
4. 更新为：

```bash
cd backend && npm install && npm run build
```

**注意**：迁移应该在启动时运行（通过 `RUN_MIGRATIONS_ON_START=true`），而不是在构建时运行，因为：
- 构建时数据库可能不可用
- 构建环境可能没有正确的数据库连接
- 迁移应该在应用启动时运行，确保数据库连接正常

### 步骤 2: 验证迁移

迁移完成后，检查：

1. **检查迁移日志**：
   - 在 Render Dashboard 中查看 "Logs"
   - 应该看到 "✅ Migration deployed successfully"
   - 不应该有 "Table does not exist" 或 "Column does not exist" 错误

2. **测试 API**：
   - 访问 `https://ecommerce-1w9j.onrender.com/api/health`（应该返回 200）
   - 测试产品列表：`https://ecommerce-1w9j.onrender.com/api/products?page=1&limit=8`（应该返回 200，不是 500）
   - 测试产品详情：选择一个产品 ID，访问 `/api/products/{id}`

3. **检查数据库表**（可选）：
   - 如果可以使用数据库客户端，检查以下表是否存在：
     - `product_variants`
     - `product_attributes`
     - `product_variant_attributes`
   - 检查 `product_variants` 表是否有 `displayOrder` 字段

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

