# 🚀 完整部署指南

## 📋 系統架構

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │
│   (Vercel)      │ ──────> │   (Render)      │
│                 │  API    │                 │
│  React + Vite   │         │  Node.js + TS   │
└─────────────────┘         └────────┬────────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │   Database      │
                            │   (Neon)        │
                            │   PostgreSQL    │
                            └─────────────────┘
```

## 🔧 後端部署 (Render)

### 1. 基本配置

- **服務類型**: Web Service
- **名稱**: ecommerce-backend
- **語言**: Node
- **分支**: main
- **Root Directory**: `backend`

### 2. 構建配置

#### Build Command
```bash
npm run build
```

**構建流程說明**:
1. `prebuild`: 自動安裝所有依賴（包括 devDependencies）
2. `clean`: 清理舊的編譯文件
3. `db:generate:no-validate`: 使用虛擬 DATABASE_URL 生成 Prisma Client（不連接真實數據庫）
4. `tsc`: 編譯 TypeScript

#### Start Command
```bash
npm start
```

**啟動流程說明**:
1. 加載環境變量
2. 連接真實數據庫
3. 運行數據庫遷移（`prisma migrate deploy`）
4. 啟動 HTTP 服務器

### 3. 環境變量（必須設置）

在 Render Dashboard → Environment 中添加：

```env
# 基本配置
NODE_ENV=production
PORT=3001

# 數據庫（你的 Neon 數據庫 URL）
DATABASE_URL=postgresql://neondb_owner:npg_Up4zTMO9AQsI@ep-withered-moon-a1v63stz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT 認證（必須至少32字符）
JWT_SECRET=<生成一個至少32字符的隨機字符串>
JWT_REFRESH_SECRET=<生成另一個至少32字符的隨機字符串>

# 前端 URL（用於 CORS 和社交登錄回調）
FRONTEND_URL=https://ecommerce-frontend-liard-omega.vercel.app

# 可選：其他服務
PASSWORD_PEPPER=<可選>
BCRYPT_ROUNDS=12
SESSION_SECRET=<可選>
```

**生成 JWT Secret 命令**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 驗證部署

部署成功後，訪問：
- `https://ecommerce-1w9j.onrender.com/` - 應該返回 API 信息
- `https://ecommerce-1w9j.onrender.com/api/products?page=1&limit=12` - 應該返回產品列表

---

## 🎨 前端部署 (Vercel)

### 1. 基本配置

- **框架**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2. 環境變量（必須設置）

在 Vercel Dashboard → Settings → Environment Variables 中添加：

```env
VITE_API_URL=https://ecommerce-1w9j.onrender.com/api
```

**重要**:
- 環境變量必須以 `VITE_` 開頭
- 添加後必須重新部署才能生效

### 3. 路由配置

確保 `frontend/vercel.json` 存在：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

這確保 React Router 的客戶端路由正常工作。

### 4. 驗證部署

部署成功後，訪問：
- `https://ecommerce-frontend-liard-omega.vercel.app/` - 應該顯示首頁
- `https://ecommerce-frontend-liard-omega.vercel.app/products` - 應該顯示產品列表

---

## ✅ 部署檢查清單

### 後端 (Render)

- [ ] Root Directory 設置為 `backend`
- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm start`
- [ ] `NODE_ENV=production` 已設置
- [ ] `DATABASE_URL` 已設置（你的 Neon 數據庫 URL）
- [ ] `JWT_SECRET` 已設置（至少32字符）
- [ ] `JWT_REFRESH_SECRET` 已設置（至少32字符）
- [ ] `FRONTEND_URL` 已設置（Vercel 前端 URL）
- [ ] `PORT=3001` 已設置

### 前端 (Vercel)

- [ ] Root Directory 設置為 `frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] `VITE_API_URL` 已設置（Render 後端 API URL）
- [ ] `frontend/vercel.json` 存在且配置正確

### 數據庫 (Neon)

- [ ] 數據庫已創建
- [ ] 連接字符串已獲取
- [ ] 遷移將在服務器啟動時自動運行

---

## 🔍 故障排除

### 後端構建失敗

**問題**: `P1002: The database server was reached but timed out`

**解決方案**:
- ✅ 已修復：構建時使用虛擬 DATABASE_URL
- 確保 `cross-env` 已安裝在 devDependencies
- 確保 `db:generate:no-validate` 腳本正確配置

### 後端啟動失敗

**問題**: `JWT_SECRET and JWT_REFRESH_SECRET must be set`

**解決方案**:
- 檢查 Render 環境變量是否正確設置
- 確保值至少32字符

### 前端 API 請求失敗

**問題**: `net::ERR_CONNECTION_REFUSED` 或 `404 Not Found`

**解決方案**:
1. 檢查 `VITE_API_URL` 是否正確設置
2. 檢查後端是否正在運行
3. 檢查 CORS 配置（確保 `FRONTEND_URL` 在後端環境變量中）

### 數據庫連接失敗

**問題**: `Can't reach database server`

**解決方案**:
- 檢查 `DATABASE_URL` 是否正確
- 檢查 Neon 數據庫是否運行
- 檢查網絡連接

---

## 📝 部署流程

### 第一次部署

1. **準備環境變量**
   - 生成 JWT secrets
   - 獲取數據庫 URL
   - 準備所有必要的 API keys

2. **部署後端**
   - 在 Render 創建 Web Service
   - 配置所有環境變量
   - 部署並等待成功

3. **部署前端**
   - 在 Vercel 連接 GitHub 倉庫
   - 配置環境變量
   - 部署並等待成功

4. **驗證**
   - 測試後端 API
   - 測試前端頁面
   - 測試 API 連接

### 更新部署

1. **本地測試**
   ```bash
   npm run build
   ```

2. **提交更改**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

3. **自動部署**
   - Render 和 Vercel 會自動檢測推送
   - 自動觸發構建和部署

---

## 🎯 當前配置摘要

### 後端 URL
```
https://ecommerce-1w9j.onrender.com
```

### 前端 URL
```
https://ecommerce-frontend-liard-omega.vercel.app
```

### 數據庫
```
Neon PostgreSQL
ep-withered-moon-a1v63stz-pooler.ap-southeast-1.aws.neon.tech
```

---

## 📞 需要幫助？

如果遇到問題：
1. 檢查 Render 和 Vercel 的部署日誌
2. 檢查瀏覽器控制台錯誤
3. 檢查網絡請求（Network 標籤）
4. 參考本文檔的故障排除部分

