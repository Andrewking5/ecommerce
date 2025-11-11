# Render 部署指南

## 後端服務部署配置

### 基本設置

1. **服務類型**: Web Service
2. **名稱**: ecommerce-backend (或你喜歡的名稱)
3. **語言**: Node
4. **分支**: main
5. **區域**: 選擇你需要的區域（建議選擇離用戶最近的區域）

### 重要配置

#### Root Directory
```
backend
```
**重要**: 必須設置為 `backend`，因為後端代碼在 `backend/` 目錄下。

#### Build Command
```bash
npm install && npm run build
```
**注意**: 如果使用分號 `;`，請改為 `&&` 以確保命令順序執行。

這個命令會：
- 安裝依賴
- 清理舊的編譯文件
- 生成 Prisma Client
- 編譯 TypeScript

#### Start Command
```bash
npm start
```
這會執行 `node dist/app.js`

### 環境變量設置

在 Render 的環境變量部分，需要添加以下變量（參考 `backend/env.example`）：

#### 必需變量

```env
# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
PASSWORD_PEPPER=your-password-pepper

# App
NODE_ENV=production
PORT=3001
API_URL=https://your-backend-url.onrender.com/api
FRONTEND_URL=https://your-frontend-url.onrender.com

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret
```

#### 可選變量（根據需要）

```env
# OAuth Social Login
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/facebook/callback

# Payment
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@yourdomain.com
```

### 數據庫設置

1. 在 Render 創建一個 PostgreSQL 數據庫
2. 獲取數據庫連接字符串
3. 將 `DATABASE_URL` 設置為環境變量
4. 部署後，需要在服務啟動時運行數據庫遷移

#### 自動遷移（推薦）

在 Build Command 中添加遷移：
```bash
npm install && npm run build && npx prisma generate && npx prisma migrate deploy
```

或者創建一個啟動腳本 `backend/start.sh`:
```bash
#!/bin/bash
npx prisma migrate deploy
npm start
```

然後在 Start Command 中使用：
```bash
bash start.sh
```

### 實例類型

- **開發/測試**: Starter ($7/month)
- **生產環境**: 建議至少使用 Standard ($25/month) 或更高

---

## 前端服務部署配置

### 基本設置

1. **服務類型**: Static Site
2. **名稱**: ecommerce-frontend
3. **分支**: main
4. **區域**: 選擇與後端相同的區域

### 配置

#### Root Directory
```
frontend
```

#### Build Command
```bash
npm install && npm run build
```

#### Publish Directory
```
dist
```

### 環境變量

在 Render 的環境變量部分添加：

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**注意**: Vite 環境變量必須以 `VITE_` 開頭才能在客戶端使用。

---

## 部署步驟

### 1. 部署後端

1. 在 Render 創建新的 Web Service
2. 連接到 GitHub 倉庫 `Andrewking5/ecommerce`
3. 按照上述配置設置
4. 添加所有環境變量
5. 點擊 "Deploy Web Service"

### 2. 部署前端

1. 在 Render 創建新的 Static Site
2. 連接到相同的 GitHub 倉庫
3. 按照上述配置設置
4. 添加 `VITE_API_URL` 環境變量（指向後端 URL）
5. 點擊 "Deploy"

### 3. 更新環境變量

部署後端後，獲取後端的 URL，然後：
1. 更新後端的 `FRONTEND_URL` 環境變量
2. 更新前端的 `VITE_API_URL` 環境變量
3. 重新部署兩個服務

---

## 數據庫遷移

### 首次部署

1. 確保 `DATABASE_URL` 環境變量已設置
2. 在 Build Command 中包含 `npx prisma migrate deploy`
3. 或者手動運行：
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma db seed  # 可選：填充初始數據
   ```

### 後續更新

每次部署時，Prisma 會自動運行遷移（如果 Build Command 中包含 `prisma migrate deploy`）。

---

## 故障排除

### 構建失敗

1. 檢查 Root Directory 是否正確設置為 `backend` 或 `frontend`
2. 檢查 Node.js 版本（需要 >= 18.0.0）
3. 查看構建日誌中的錯誤信息

### 啟動失敗

1. 檢查所有必需的環境變量是否已設置
2. 檢查數據庫連接是否正常
3. 檢查端口設置（Render 會自動設置 PORT 環境變量）

### 數據庫連接問題

1. 確保 PostgreSQL 數據庫已創建
2. 檢查 `DATABASE_URL` 格式是否正確
3. 確保數據庫允許來自 Render 的連接

### CORS 錯誤

1. 確保後端的 `FRONTEND_URL` 環境變量設置為正確的前端 URL
2. 檢查後端的 CORS 配置

---

## 安全建議

1. **永遠不要**在代碼中硬編碼敏感信息
2. 使用 Render 的環境變量功能存儲所有密鑰
3. 定期輪換 API 密鑰和 JWT secrets
4. 使用 HTTPS（Render 自動提供）
5. 啟用 Render 的自動安全更新

---

## 監控和日誌

- Render 提供實時日誌查看
- 可以設置健康檢查端點：`/api/health`
- 建議集成 Sentry 或其他錯誤監控服務

---

## 成本估算

- **後端**: Starter ($7/month) 或 Standard ($25/month)
- **前端**: Static Site (免費)
- **數據庫**: Starter ($7/month) 或 Standard ($25/month)

**總計**: 約 $14-50/month（取決於實例類型）

