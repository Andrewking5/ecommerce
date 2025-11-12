# Render 環境變量檢查清單

## 必須設置的環境變量

### 基本配置
```env
NODE_ENV=production
PORT=3001
```

### 數據庫
```env
DATABASE_URL=postgresql://neondb_owner:npg_Up4zTMO9AQsI@ep-withered-moon-a1v63stz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### JWT 認證
```env
JWT_SECRET=<你的JWT密鑰，至少32字符>
JWT_REFRESH_SECRET=<你的刷新令牌密鑰，至少32字符>
```

### 前端 URL（重要！）
```env
FRONTEND_URL=https://ecommerce-frontend-liard-omega.vercel.app
```

**注意**：這個變量用於：
1. CORS 配置 - 允許前端域名訪問 API
2. 社交登錄回調 - 重定向到正確的前端 URL

## 檢查步驟

1. 登入 [Render Dashboard](https://dashboard.render.com)
2. 選擇你的 Web Service: `ecommerce-1w9j`
3. 點擊 **"Environment"** 標籤
4. 確認以下環境變量已設置：
   - ✅ `NODE_ENV=production`
   - ✅ `PORT=3001`
   - ✅ `DATABASE_URL` (你的 Neon 數據庫 URL)
   - ✅ `JWT_SECRET` (至少32字符)
   - ✅ `JWT_REFRESH_SECRET` (至少32字符)
   - ✅ `FRONTEND_URL=https://ecommerce-frontend-liard-omega.vercel.app`

## 如果缺少 `FRONTEND_URL`

1. 點擊 **"Add Environment Variable"**
2. 設置：
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://ecommerce-frontend-liard-omega.vercel.app`
3. 點擊 **"Save Changes"**
4. Render 會自動重新部署

## 驗證

部署完成後，檢查 Render 日誌：

1. 在 Render Dashboard 中點擊你的服務
2. 點擊 **"Logs"** 標籤
3. 查找以下日誌：
   ```
   🌐 CORS check: { origin: '...', allowedOrigins: [...], ... }
   📥 GET /api/products?page=1&limit=12 - ...
   📤 GET /api/products?page=1&limit=12 - 200 - ...
   ```

如果看到 `⚠️ CORS blocked:` 或 `❌ 404 Not Found:`，請檢查：
- `FRONTEND_URL` 是否正確設置
- 前端是否使用正確的 API URL (`https://ecommerce-1w9j.onrender.com/api`)

