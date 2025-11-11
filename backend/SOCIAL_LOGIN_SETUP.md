# 社交登录设置指南

## 已完成的功能

✅ Google OAuth 登录
✅ Facebook OAuth 登录  
✅ Apple OAuth 登录
✅ 自动创建/更新用户账户
✅ 记录社交登录信息（provider, providerId, providerData）
✅ 头像自动同步
✅ 前端社交登录按钮

## 数据库迁移

运行以下命令更新数据库 schema：

```bash
cd backend
npx prisma migrate dev --name add_social_login
npx prisma generate
```

## 环境变量配置

在 `backend/.env` 文件中添加以下配置：

### Google OAuth
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API（在"API 和服务" → "库"中搜索并启用）
4. 配置 OAuth 同意画面（"API 和服务" → "OAuth 同意画面"）
5. 创建 OAuth 2.0 客户端 ID（"API 和服务" → "凭据" → "创建凭据" → "OAuth 2.0 客户端 ID"）

**配置 OAuth 客户端时：**
- **应用类型**：选择"网页应用程式"（Web application）
- **名称**：例如 "E-commerce Web Client"
- **已授权的 JavaScript 来源**：点击"+ 新增 URI"，添加：
  - `http://localhost:3000`
  - `http://localhost:3001`
- **已授权的重新导向前 URI**：点击"+ 新增 URI"，添加：
  - `http://localhost:3001/api/auth/google/callback`

6. 创建后，复制**客户端 ID**和**客户端密钥**

```env
GOOGLE_CLIENT_ID="你的客户端ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="你的客户端密钥"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"
```

**重要提示：**
- 如果客户端已创建但需要修改 URI，可以点击客户端名称进入编辑页面
- 设置更改可能需要 5 分钟到数小时才会生效
- 生产环境需要添加生产域名到已授权的 URI

### Facebook OAuth
1. 访问 [Facebook Developers](https://developers.facebook.com/)
2. 创建新应用
3. 添加 Facebook 登录产品
4. 设置有效的 OAuth 重定向 URI: `http://localhost:3001/api/auth/facebook/callback`

```env
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_CALLBACK_URL="http://localhost:3001/api/auth/facebook/callback"
```

### Apple OAuth
1. 访问 [Apple Developer](https://developer.apple.com/)
2. 创建 App ID 和 Service ID
3. 配置 Sign in with Apple
4. 创建私钥文件

```env
APPLE_CLIENT_ID="your-apple-service-id"
APPLE_TEAM_ID="your-apple-team-id"
APPLE_KEY_ID="your-apple-key-id"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APPLE_CALLBACK_URL="http://localhost:3001/api/auth/apple/callback"
```

## 功能说明

### 用户数据记录

系统会自动记录以下信息：
- **provider**: 登录方式 (GOOGLE, APPLE, FACEBOOK, EMAIL)
- **providerId**: 第三方平台的用户 ID
- **providerData**: 第三方平台的额外信息（JSON 格式）
- **avatar**: 用户头像 URL（自动从第三方平台获取）
- **email**: 用户邮箱
- **firstName/lastName**: 用户姓名

### 账户合并

如果用户使用相同邮箱但不同登录方式：
- 系统会自动合并账户
- 更新登录方式信息
- 保留所有订单和历史记录

### 安全特性

- 社交登录用户无需密码
- JWT token 认证
- 自动同步用户信息
- 支持账户关联

## 测试

1. 启动后端服务器
2. 访问登录页面
3. 点击社交登录按钮
4. 完成 OAuth 授权
5. 自动跳转并登录成功

## 注意事项

- 生产环境需要更新回调 URL
- Apple 登录需要 HTTPS（生产环境）
- 确保 CORS 配置正确
- 定期更新 OAuth 密钥

