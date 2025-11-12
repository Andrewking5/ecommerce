# 403 Forbidden 错误排查指南

## 问题描述

访问管理后台API时出现 `403 Forbidden` 错误，通常是因为用户权限不足。

## 可能的原因

1. **用户角色不是 ADMIN**
   - 当前登录的用户角色不是管理员
   - 需要将用户角色升级为 ADMIN

2. **Token 验证失败**
   - Token 已过期
   - Token 无效
   - 需要重新登录

3. **用户未登录**
   - 没有提供有效的认证Token
   - 需要先登录

## 解决方案

### 1. 检查用户角色

使用以下命令检查用户角色：

```bash
cd backend
ts-node scripts/check-user-role.ts <your-email>
```

例如：
```bash
ts-node scripts/check-user-role.ts admin@example.com
```

### 2. 升级用户为管理员

如果用户角色不是 ADMIN，使用以下命令升级：

```bash
cd backend
ts-node scripts/update-user-role.ts <your-email> ADMIN
```

例如：
```bash
ts-node scripts/update-user-role.ts admin@example.com ADMIN
```

### 3. 使用环境变量创建初始管理员

在 `backend/.env` 文件中设置：

```env
INIT_ADMIN_EMAIL=admin@example.com
INIT_ADMIN_PASSWORD=your-secure-password
INIT_ADMIN_FIRST_NAME=Admin
INIT_ADMIN_LAST_NAME=User
```

然后重启后端服务器，系统会自动创建或升级该用户为管理员。

### 4. 重新登录

如果 Token 过期，需要：
1. 在前端登出
2. 重新登录
3. 确保使用管理员账户登录

## 验证步骤

1. 检查后端日志，查看是否有以下调试信息：
   ```
   🔐 Admin check: { userRole: 'ADMIN', isAdmin: true }
   ```

2. 如果看到 `isAdmin: false`，说明用户角色不是 ADMIN

3. 检查前端控制台，确认 Token 是否正确传递：
   ```
   📤 API Request: { hasToken: true, tokenPreview: 'eyJhbGciOiJIUzI1NiIs...' }
   ```

## 常见问题

### Q: 我已经设置了 INIT_ADMIN_EMAIL，但用户还不是管理员？

A: 确保：
- 环境变量已正确设置
- 后端服务器已重启
- 检查后端启动日志，应该看到：
  ```
  ✅ User admin@example.com has been upgraded to ADMIN
  ```

### Q: 如何确认当前登录用户的角色？

A: 在前端控制台的 Network 标签中，查看 `/api/users/profile` 请求的响应，应该包含 `role: "ADMIN"`

### Q: 我可以直接在数据库中修改用户角色吗？

A: 可以，但建议使用提供的脚本：
```bash
ts-node scripts/update-user-role.ts <email> ADMIN
```

## 相关文件

- `backend/src/middleware/auth.ts` - 权限验证中间件
- `backend/scripts/check-user-role.ts` - 检查用户角色脚本
- `backend/scripts/update-user-role.ts` - 更新用户角色脚本
- `backend/src/utils/createInitialAdmin.ts` - 自动创建管理员工具

