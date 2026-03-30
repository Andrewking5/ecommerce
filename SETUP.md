# 🚀 E-commerce Platform Setup Guide

## 快速開始

### 1. 環境準備
- Node.js 18+ 
- npm 9+
- PostgreSQL 資料庫 (或 Supabase 帳號)

### 2. 安裝依賴
```bash
# 安裝根目錄依賴
npm install

# 安裝後端依賴
cd backend
npm install

# 安裝前端依賴
cd ../frontend
npm install
```

### 3. 環境變數設定

#### 後端環境變數 (backend/.env)
```env
# 資料庫
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
PASSWORD_PEPPER="your-password-pepper"

# 第三方服務
STRIPE_SECRET_KEY="sk_test_..."
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# 郵件
SENDGRID_API_KEY="SG..."
FROM_EMAIL="noreply@yourdomain.com"

# 應用程式
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"
```

#### 前端環境變數 (frontend/.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=E-commerce Store
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 4. 資料庫設定
```bash
cd backend

# 生成 Prisma 客戶端
npx prisma generate

# 執行資料庫遷移
npx prisma migrate dev

# 種子資料
npx prisma db seed
```

### 5. 啟動開發環境

#### 方法一：使用腳本 (Windows)
```bash
# 雙擊執行
start-dev.bat
```

#### 方法二：手動啟動
```bash
# 終端 1: 啟動後端
cd backend
npm run dev

# 終端 2: 啟動前端
cd frontend
npm run dev
```

### 6. 訪問應用程式
- 前端: http://localhost:3000
- 後端 API: http://localhost:3001/api
- API 文件: http://localhost:3001/api/health

## 帳號設定

管理員帳號請透過環境變數 `INIT_ADMIN_EMAIL` / `INIT_ADMIN_PASSWORD` 設定，
或使用 `scripts/update-user-role.ts` 將現有用戶升級為管理員。

## 功能特色

### ✅ 已實現功能
- 🏠 **首頁**: Apple 風格設計
- 🛍️ **商品展示**: 商品列表、詳情、搜尋
- 🛒 **購物車**: 添加、移除、數量調整
- 👤 **用戶系統**: 註冊、登入、個人資料
- 📦 **訂單管理**: 訂單歷史、詳情查看
- 🎨 **響應式設計**: 支援手機、平板、桌面
- 🔒 **安全認證**: JWT + Refresh Token
- 📱 **現代化 UI**: TailwindCSS + Framer Motion

### 🚧 待實現功能
- 💳 **支付整合**: Stripe 支付
- 📧 **郵件通知**: 訂單確認、狀態更新
- 🖼️ **圖片上傳**: Cloudinary 整合
- 📊 **管理後台**: 商品管理、訂單處理
- 🔍 **進階搜尋**: 篩選、排序
- ⭐ **評論系統**: 商品評分、評論

## 技術棧

### 前端
- React 18 + TypeScript
- Vite (建構工具)
- TailwindCSS (樣式)
- Framer Motion (動畫)
- Zustand (狀態管理)
- React Query (伺服器狀態)
- React Hook Form + Zod (表單驗證)

### 後端
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT 認證
- bcrypt 密碼雜湊

### 部署
- 前端: Vercel
- 後端: Railway/Render
- 資料庫: Supabase

## 開發指令

```bash
# 開發模式
npm run dev

# 建構
npm run build

# 測試
npm run test

# 程式碼檢查
npm run lint

# 型別檢查
npm run type-check
```

## 故障排除

### 常見問題

1. **資料庫連線失敗**
   - 檢查 DATABASE_URL 是否正確
   - 確認 PostgreSQL 服務是否運行

2. **JWT 錯誤**
   - 檢查 JWT_SECRET 和 JWT_REFRESH_SECRET 是否設定
   - 確保密鑰長度至少 32 字元

3. **CORS 錯誤**
   - 檢查 FRONTEND_URL 是否正確設定
   - 確認前端 URL 在 CORS 白名單中

4. **依賴安裝失敗**
   - 清除快取: `npm cache clean --force`
   - 刪除 node_modules 重新安裝

## 支援

如有問題，請檢查：
1. 環境變數是否正確設定
2. 資料庫是否正常運行
3. 依賴是否完整安裝
4. 端口是否被佔用

---

🎉 **恭喜！您已成功設定 E-commerce Platform！**


