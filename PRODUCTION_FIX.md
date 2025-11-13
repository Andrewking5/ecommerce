# 生产环境修复指南

## 问题诊断

生产环境出现 500 错误的主要原因是：

1. **数据库 Schema 不同步**：生产环境数据库缺少 `displayOrder` 字段
2. **代码使用了新字段但数据库未更新**：查询时尝试使用 `displayOrder` 排序导致错误
3. **数据库表不存在**：`product_variants`, `product_attributes`, `product_variant_attributes` 表可能不存在

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
- ✅ **新增**：`getProductById` 添加了容错处理，如果 variants 查询失败会回退到不包含 variants 的查询

### 2. 错误处理改进

- ✅ 添加了 `SCHEMA_MISMATCH` 错误代码
- ✅ 改进了 `inventoryController` 的错误响应
- ✅ 改进了 `productController` 的 Prisma 错误处理
- ✅ **新增**：添加了 P2021（表不存在）和 P2022（列不存在）错误检测
- ✅ **新增**：改进了错误消息，包含迁移提示

## 需要执行的步骤

### 步骤 1: 在 Render 上运行数据库迁移（必须）

**⚠️ 这是解决 500 错误的关键步骤！**

**方法 1: 通过 Render Shell（推荐，最快）**

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 选择你的 Web Service（`ecommerce-1w9j`）
3. 点击 **"Shell"** 标签（在左侧菜单中）
4. 等待 Shell 连接成功
5. 运行以下命令：

```bash
cd backend
npm run db:deploy
```

6. 等待迁移完成（应该看到 "✅ Migration deployed successfully"）
7. 如果看到错误，检查：
   - DATABASE_URL 环境变量是否正确
   - 数据库服务是否正常运行
   - 网络连接是否正常

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

### 步骤 3: 恢复完整功能（迁移完成后，可选）

迁移完成后，可以恢复使用 `displayOrder` 字段以获得更好的排序功能。但这不是必须的，当前代码已经可以正常工作。

如果需要恢复：
1. 恢复 `variantController.ts` 中的 `displayOrder` 排序
2. 恢复 `attributeController.ts` 中的 `displayOrder` 排序

**注意**：只有在确认迁移成功且 `displayOrder` 字段存在后才执行此步骤。

## 401 错误处理

401 错误通常是认证问题，已通过以下方式处理：

- ✅ Token 自动刷新机制（前端已实现）
- ✅ 改进的错误日志
- ✅ 自动重试机制

如果持续出现 401 错误，检查：

1. **JWT 环境变量**：
   - `JWT_SECRET` 和 `JWT_REFRESH_SECRET` 是否正确设置
   - 长度是否至少 32 字符
   - 在 Render Dashboard → Environment 中检查

2. **Token 问题**：
   - 清除浏览器缓存和 localStorage
   - 重新登录
   - 检查浏览器控制台的错误信息

3. **前端配置**：
   - 检查 `VITE_API_URL` 是否正确
   - 确认前端正确发送 `Authorization` header

## 验证修复

修复后，以下 API 应该正常工作：

- ✅ `GET /api/products` - 产品列表（应该返回 200，不是 500）
- ✅ `GET /api/products/:id` - 产品详情（应该返回 200，不是 500）
- ✅ `GET /api/admin/inventory/low-stock` - 低库存产品（需要管理员认证）
- ✅ `GET /api/users` - 用户列表（需要认证，应该返回 200，不是 401）
- ✅ `GET /api/orders/admin/all` - 订单列表（需要管理员认证）

**测试步骤**：
1. 打开浏览器开发者工具（F12）
2. 访问前端应用
3. 查看 Network 标签
4. 检查 API 请求的响应状态码
5. 如果看到 500 错误，检查响应内容中的错误信息
6. 如果错误信息包含 "SCHEMA_MISMATCH"，说明需要运行数据库迁移

## 注意事项

1. **数据库迁移是安全的**：
   - `displayOrder` 字段有默认值（0），不会影响现有数据
   - 新表（`product_variants`, `product_attributes`）是空的，不会影响现有数据
   - 迁移是增量的，只添加新字段和表，不会删除或修改现有数据

2. **迁移时间**：
   - 根据数据量，迁移可能需要 1-5 分钟
   - 如果迁移超时，检查数据库连接和网络

3. **迁移失败处理**：
   - 如果迁移失败，检查 Render 日志中的错误信息
   - 常见错误：
     - 数据库连接超时 → 检查 DATABASE_URL
     - 权限不足 → 检查数据库用户权限
     - 表已存在 → 说明迁移已经运行过，可以忽略

4. **备份建议**：
   - 虽然迁移是安全的，但建议在重要生产环境运行前备份数据库
   - Neon 数据库通常有自动备份功能

## 核心问题总结

**500 错误的根本原因**：
1. 数据库缺少新表：`product_variants`, `product_attributes`, `product_variant_attributes`
2. 数据库缺少新字段：`displayOrder`, `hasVariants`, `basePrice`, `minPrice`, `maxPrice`
3. 代码尝试查询这些不存在的表和字段，导致 Prisma 查询失败

**解决方案**：
1. ✅ 代码已修复：添加了容错处理，如果 variants 查询失败会回退
2. ✅ 错误处理改进：提供更清晰的错误信息
3. ⚠️ **必须执行**：运行数据库迁移以创建缺失的表和字段

**迁移命令**（在 Render Shell 中运行）：
```bash
cd backend
npm run db:deploy
```

## 后续优化

迁移完成后，建议：

1. 恢复 `displayOrder` 字段的使用（获得更好的排序功能）
2. 添加数据库迁移监控
3. 设置自动迁移检查
4. 定期检查数据库 schema 是否与代码同步
