# Render 管理員帳號設置指南

## 問題說明

如果遇到 `403 (Forbidden)` 錯誤，通常是因為：
1. 當前登錄的用戶不是 ADMIN 角色
2. Token 無效或過期
3. 環境變數未正確設置

## 解決方案

### 方法 1：使用環境變數自動創建（推薦）

在 Render 上設置以下環境變數，服務器啟動時會自動創建管理員：

1. 登入 [Render Dashboard](https://dashboard.render.com)
2. 選擇你的 Web Service（例如：`ecommerce-1w9j`）
3. 點擊 **"Environment"** 標籤
4. 添加以下環境變數：

```env
INIT_ADMIN_EMAIL=admin@gmail.com
INIT_ADMIN_PASSWORD=Admin123!
INIT_ADMIN_FIRST_NAME=Admin
INIT_ADMIN_LAST_NAME=User
```

5. 點擊 **"Save Changes"**（會自動重新部署）

**重要**：
- 密碼必須至少 8 個字符
- 如果該 email 已存在，會自動升級為 ADMIN
- 創建成功後，建議刪除這些環境變數以確保安全

### 方法 2：使用 API 端點創建（僅首次）

如果還沒有任何管理員，可以使用 API 端點創建：

```bash
curl -X POST https://ecommerce-1w9j.onrender.com/api/admin/create-first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

**注意**：此端點僅在沒有任何管理員時可用。

### 方法 3：檢查現有用戶角色

如果用戶已存在但角色不是 ADMIN，需要：

1. 使用腳本更新角色（本地運行）：
```bash
cd backend
npm run admin:update admin@gmail.com ADMIN
```

2. 或者直接在數據庫中更新（如果有數據庫訪問權限）

## 驗證設置

1. **檢查 Render 日誌**：
   - 查看服務器啟動日誌
   - 應該看到：`✅ Initial admin account created successfully!` 或 `✅ User admin@gmail.com has been upgraded to ADMIN`

2. **使用管理員帳號登錄**：
   - 使用設置的 email 和 password 登錄
   - 登錄後應該可以訪問管理後台

3. **檢查 Token**：
   - 登錄後，檢查瀏覽器控制台的 Network 標籤
   - 確認請求頭包含 `Authorization: Bearer <token>`
   - 如果看到 "Invalid or expired token"，可能是 JWT_SECRET 不匹配

## 常見問題

### Q: 為什麼還是 403？

**A**: 可能的原因：
1. 當前登錄的用戶不是 ADMIN 角色
2. Token 已過期（需要重新登錄）
3. JWT_SECRET 在 Render 上設置錯誤

**解決方法**：
1. 確認環境變數已設置並重新部署
2. 登出並重新登錄
3. 檢查 Render 日誌確認管理員創建成功

### Q: 如何確認我的帳號是 ADMIN？

**A**: 
1. 檢查 Render 日誌中的調試信息：
   ```
   🔐 Admin check: {
     userRole: 'ADMIN',
     isAdmin: true
   }
   ```
2. 如果看到 `isAdmin: false`，說明角色不是 ADMIN

### Q: .env.example 可以上傳到 Git 嗎？

**A**: **可以！** `.env.example` 應該上傳到 Git，因為：
- 它不包含敏感信息（只是範例）
- 幫助其他開發者了解需要哪些環境變數
- 標準做法

**不能上傳的是** `.env` 文件（實際的環境變數值）

## 環境變數清單

### 必需變數（必須設置）

```env
# 資料庫
DATABASE_URL=postgresql://...

# JWT 認證
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# 應用 URL
FRONTEND_URL=https://your-frontend.vercel.app
API_URL=https://your-backend.onrender.com/api

# 初始管理員（首次部署使用）
INIT_ADMIN_EMAIL=admin@gmail.com
INIT_ADMIN_PASSWORD=Admin123!
INIT_ADMIN_FIRST_NAME=Admin
INIT_ADMIN_LAST_NAME=User
```

## 安全建議

1. **創建管理員後刪除環境變數**：
   - 管理員創建成功後，從 Render 環境變數中刪除 `INIT_ADMIN_*` 變數
   - 這可以防止未授權訪問

2. **使用強密碼**：
   - 密碼至少 8 個字符
   - 包含大小寫字母、數字和特殊字符

3. **定期輪換密碼**：
   - 定期更改管理員密碼
   - 使用安全的密碼管理器

