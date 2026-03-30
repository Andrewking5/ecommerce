# E-commerce 平台開發規範

> **版本**: 1.0.0  
> **最後更新**: 2024-11-11  
> **目的**: 提供完整的開發規範，確保每次開發都能清楚了解製作方向，避免錯誤設定

---

## 📋 目錄

1. [專案架構總覽](#專案架構總覽)
2. [技術棧規範](#技術棧規範)
3. [環境變數配置規範](#環境變數配置規範)
4. [專案結構規範](#專案結構規範)
5. [開發規範](#開發規範)
6. [代碼規範](#代碼規範)
7. [API 設計規範](#api-設計規範)
8. [資料庫規範](#資料庫規範)
9. [部署規範](#部署規範)
10. [安全規範](#安全規範)
11. [測試規範](#測試規範)
12. [常見問題與解決方案](#常見問題與解決方案)

---

## 專案架構總覽

### 專案類型
- **類型**: 全端電商平台（Full-Stack E-commerce Platform）
- **架構**: 前後端分離（Frontend-Backend Separation）
- **設計風格**: Apple 官網風格（極簡、白色背景、大圖、優雅字體、流暢動畫）

### 部署架構

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend       │         │   Backend        │
│   (Vercel)       │◄────────┤   (Render)        │
│                 │  HTTPS  │                 │
│   React + Vite   │         │   Express + TS   │
└─────────────────┘         └─────────────────┘
                                      │
                                      │ PostgreSQL
                                      ▼
                            ┌─────────────────┐
                            │   Database      │
                            │   (Neon/Render) │
                            └─────────────────┘
```

### 專案目錄結構

```
E-commerce/
├── frontend/              # 前端應用（部署在 Vercel）
│   ├── src/
│   │   ├── components/    # React 組件
│   │   ├── pages/         # 頁面組件
│   │   ├── services/      # API 服務層
│   │   ├── store/         # Zustand 狀態管理
│   │   ├── hooks/         # 自定義 Hooks
│   │   ├── utils/         # 工具函數
│   │   └── types/         # TypeScript 類型
│   ├── env.example        # 環境變數範例
│   └── package.json
│
├── backend/               # 後端應用（部署在 Render）
│   ├── src/
│   │   ├── controllers/   # 控制器層
│   │   ├── services/      # 業務邏輯層
│   │   ├── middleware/    # 中介軟體
│   │   ├── routes/        # 路由定義
│   │   ├── utils/         # 工具函數
│   │   └── types/         # TypeScript 類型
│   ├── prisma/            # 資料庫 Schema
│   ├── env.example        # 環境變數範例
│   └── package.json
│
└── docs/                  # 文檔
```

---

## 技術棧規範

### 前端技術棧（必須遵守）

| 技術 | 版本 | 用途 | 備註 |
|------|------|------|------|
| React | ^18.2.0 | UI 框架 | 必須使用函數式組件 + Hooks |
| TypeScript | ^5.2.2 | 類型安全 | 所有文件必須使用 TypeScript |
| Vite | ^5.0.8 | 建構工具 | 不使用 Create React App |
| TailwindCSS | ^3.3.6 | 樣式框架 | 原子化 CSS，不使用 CSS Modules |
| Zustand | ^4.5.7 | 狀態管理 | 不使用 Redux |
| React Router | ^6.20.1 | 路由管理 | 使用最新版本 |
| Axios | ^1.6.2 | HTTP 客戶端 | 統一使用 Axios |
| React Hook Form | ^7.48.2 | 表單處理 | 配合 Zod 驗證 |
| Framer Motion | ^10.16.16 | 動畫庫 | 僅用於複雜動畫 |

### 後端技術棧（必須遵守）

| 技術 | 版本 | 用途 | 備註 |
|------|------|------|------|
| Node.js | >=18.0.0 | 運行環境 | 必須 >= 18.0.0 |
| Express | ^4.18.2 | Web 框架 | 不使用 NestJS |
| TypeScript | ^5.3.3 | 類型安全 | 所有文件必須使用 TypeScript |
| Prisma | ^5.7.1 | ORM | 不使用 Sequelize 或 TypeORM |
| PostgreSQL | 15+ | 資料庫 | 使用 Prisma 管理 |
| JWT | ^9.0.2 | 認證 | Access Token + Refresh Token |
| bcrypt | ^5.1.1 | 密碼雜湊 | 必須使用 bcrypt |

### 第三方服務（必須遵守）

| 服務 | 用途 | 配置位置 |
|------|------|----------|
| **Render** | 後端部署 | 環境變數在 Render Dashboard |
| **Vercel** | 前端部署 | 環境變數在 Vercel Dashboard |
| **Neon/Render PostgreSQL** | 資料庫 | DATABASE_URL 環境變數 |
| **Cloudinary** | 圖片存儲 | CLOUDINARY_* 環境變數 |
| **Stripe** | 支付處理 | STRIPE_* 環境變數 |
| **SendGrid** | 郵件服務 | SENDGRID_API_KEY 環境變數 |

---

## 環境變數配置規範

### ⚠️ 重要原則

1. **禁止硬編碼**: 所有配置必須使用環境變數
2. **正式版使用平台配置**: Render 和 Vercel 的環境變數設置
3. **測試版使用 .env.example**: 本地開發參考
4. **敏感信息**: 永遠不要提交 `.env` 文件到 Git

### 後端環境變數（Render）

#### 必需變數（必須設置）

```env
# ============================================
# 基本配置
# ============================================
NODE_ENV=production
PORT=3001

# ============================================
# 資料庫配置
# ============================================
DATABASE_URL=postgresql://username:password@host:5432/database
# 格式: postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require

# ============================================
# JWT 認證（必須至少 32 字符）
# ============================================
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long
PASSWORD_PEPPER=your-password-pepper-min-16-chars

# ============================================
# 應用程式 URL（重要！）
# ============================================
API_URL=https://your-backend-url.onrender.com/api
FRONTEND_URL=https://your-frontend-url.vercel.app
# 注意: FRONTEND_URL 用於 CORS 和社交登錄回調

# ============================================
# 安全設定
# ============================================
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-min-32-chars
```

#### 可選變數（根據功能需求）

```env
# ============================================
# OAuth 社交登錄
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/facebook/callback

# ============================================
# 支付服務（Stripe）
# ============================================
STRIPE_SECRET_KEY=sk_live_...  # 生產環境使用 sk_live_
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# 圖片存儲（Cloudinary）
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# 郵件服務（SendGrid）
# ============================================
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@yourdomain.com

# ============================================
# 監控服務（可選）
# ============================================
SENTRY_DSN=https://...
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# ============================================
# 檔案上傳設定
# ============================================
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# ============================================
# 初始管理員帳號（僅首次部署使用）
# ============================================
INIT_ADMIN_EMAIL=your-admin-email
INIT_ADMIN_PASSWORD=your-secure-password
INIT_ADMIN_FIRST_NAME=Admin
INIT_ADMIN_LAST_NAME=User
```

#### Render 環境變數設置步驟

1. 登入 [Render Dashboard](https://dashboard.render.com)
2. 選擇你的 Web Service（例如：`ecommerce-1w9j`）
3. 點擊 **"Environment"** 標籤
4. 點擊 **"Add Environment Variable"**
5. 輸入 Key 和 Value
6. 點擊 **"Save Changes"**（會自動重新部署）

### 前端環境變數（Vercel）

#### 必需變數（必須設置）

```env
# ============================================
# API 配置（重要！）
# ============================================
VITE_API_URL=https://your-backend-url.onrender.com/api
# 注意: Vite 環境變數必須以 VITE_ 開頭才能在客戶端使用

# ============================================
# 應用程式配置
# ============================================
VITE_APP_NAME=E-commerce Store
```

#### 可選變數（根據功能需求）

```env
# ============================================
# 第三方服務（客戶端使用）
# ============================================
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Stripe 公開金鑰
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name

# ============================================
# 分析服務
# ============================================
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

#### Vercel 環境變數設置步驟

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的專案（例如：`ecommerce-frontend-liard-omega`）
3. 點擊 **"Settings"** → **"Environment Variables"**
4. 點擊 **"Add New"**
5. 輸入 Key（例如：`VITE_API_URL`）和 Value
6. 選擇環境（Production, Preview, Development）
7. 點擊 **"Save"**
8. **重要**: 必須重新部署才能生效

### 本地開發環境變數

#### 後端 `.env`（參考 `backend/env.example`）

```env
# 複製 env.example 並修改為本地配置
cp backend/env.example backend/.env
```

#### 前端 `.env`（參考 `frontend/env.example`）

```env
# 複製 env.example 並修改為本地配置
cp frontend/env.example frontend/.env
```

---

## 專案結構規範

### 前端結構規範

```
frontend/src/
├── components/           # 可重用組件
│   ├── ui/              # 基礎 UI 組件（Button, Input, Modal 等）
│   ├── layout/          # 佈局組件（Header, Footer, Sidebar）
│   ├── features/       # 功能組件（auth, products, cart, orders）
│   └── common/         # 通用組件（Loading, ErrorBoundary）
│
├── pages/              # 頁面組件（路由對應的頁面）
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   └── admin/         # 管理員頁面
│
├── services/          # API 服務層
│   ├── api.ts         # Axios 實例配置
│   ├── auth.ts        # 認證 API
│   ├── products.ts    # 商品 API
│   ├── orders.ts      # 訂單 API
│   └── upload.ts      # 上傳 API
│
├── store/             # Zustand 狀態管理
│   ├── authStore.ts   # 認證狀態
│   ├── cartStore.ts   # 購物車狀態
│   └── index.ts       # Store 導出
│
├── hooks/             # 自定義 Hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProducts.ts
│
├── utils/              # 工具函數
│   ├── constants.ts   # 常量定義
│   ├── helpers.ts      # 輔助函數
│   ├── validators.ts  # 驗證函數
│   └── formatters.ts  # 格式化函數
│
├── types/              # TypeScript 類型定義
│   ├── auth.ts
│   ├── product.ts
│   ├── order.ts
│   └── api.ts
│
└── styles/             # 樣式文件
    └── index.css       # 全局樣式
```

### 後端結構規範

```
backend/src/
├── controllers/        # 控制器層（處理 HTTP 請求）
│   ├── authController.ts
│   ├── productController.ts
│   ├── orderController.ts
│   ├── userController.ts
│   └── uploadController.ts
│
├── services/          # 業務邏輯層（核心業務邏輯）
│   ├── authService.ts
│   ├── productService.ts
│   ├── orderService.ts
│   └── emailService.ts
│
├── middleware/        # 中介軟體
│   ├── auth.ts        # JWT 認證
│   ├── validation.ts  # 請求驗證
│   ├── errorHandler.ts # 錯誤處理
│   ├── rateLimiter.ts # 請求限制
│   └── requestLogger.ts # 請求日誌
│
├── routes/            # 路由定義
│   ├── auth.ts
│   ├── products.ts
│   ├── orders.ts
│   ├── users.ts
│   └── admin.ts
│
├── utils/             # 工具函數
│   ├── validation.ts  # 驗證工具
│   └── helpers.ts     # 輔助函數
│
├── types/             # TypeScript 類型定義
│   └── prisma.d.ts    # Prisma 類型擴展
│
├── config/            # 配置文件
│   └── passport.ts    # Passport 配置（OAuth）
│
├── app.ts             # Express 應用配置
└── server.ts          # 服務器啟動文件
```

---

## 開發規範

### Git 工作流程

1. **分支命名**:
   - `main`: 生產環境分支
   - `develop`: 開發分支
   - `feature/功能名稱`: 功能分支
   - `fix/問題描述`: 修復分支

2. **提交訊息規範**:
   ```
   type(scope): subject
   
   body
   
   footer
   ```
   
   範例:
   ```
   feat(product): 新增商品搜尋功能
   
   實現了商品名稱和描述的全文搜尋
   支援價格區間篩選
   
   Closes #123
   ```

3. **提交類型**:
   - `feat`: 新功能
   - `fix`: 修復 Bug
   - `docs`: 文檔更新
   - `style`: 代碼格式調整
   - `refactor`: 重構
   - `test`: 測試相關
   - `chore`: 構建/工具變更

### 開發流程

1. **開始開發前**:
   - 確認環境變數已正確設置
   - 確認資料庫連接正常
   - 確認依賴已安裝

2. **開發中**:
   - 遵循代碼規範
   - 編寫清晰的註釋
   - 進行單元測試

3. **提交前**:
   - 運行 `npm run lint` 檢查代碼
   - 運行 `npm run type-check` 檢查類型
   - 運行 `npm test` 執行測試

### 命名規範

#### 文件命名
- **組件文件**: PascalCase（例如：`ProductCard.tsx`）
- **工具文件**: camelCase（例如：`formatPrice.ts`）
- **類型文件**: camelCase（例如：`productTypes.ts`）

#### 變數命名
- **變數/函數**: camelCase（例如：`getUserData`）
- **常量**: UPPER_SNAKE_CASE（例如：`MAX_FILE_SIZE`）
- **組件**: PascalCase（例如：`ProductCard`）
- **類型/介面**: PascalCase（例如：`UserData`）

---

## 代碼規範

### TypeScript 規範

1. **必須使用 TypeScript**: 所有 `.js` 文件必須改為 `.ts` 或 `.tsx`
2. **類型定義**: 所有函數參數和返回值必須有類型
3. **避免使用 `any`**: 必須明確類型，或使用 `unknown`

```typescript
// ✅ 正確
interface User {
  id: string;
  email: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ 錯誤
function getUser(id: any): any {
  // ...
}
```

### React 組件規範

1. **使用函數式組件**: 不使用類組件
2. **使用 Hooks**: 不使用 HOC 或 Render Props
3. **Props 類型定義**: 必須定義 Props 介面

```typescript
// ✅ 正確
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart 
}) => {
  return (
    <div>
      {/* ... */}
    </div>
  );
};

// ❌ 錯誤
export const ProductCard = ({ product, onAddToCart }) => {
  // ...
};
```

### API 調用規範

1. **統一使用 Axios**: 不使用 `fetch`
2. **錯誤處理**: 必須處理錯誤情況
3. **Loading 狀態**: 必須顯示載入狀態

```typescript
// ✅ 正確
const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  },
});

if (isLoading) return <Loading />;
if (error) return <Error message={error.message} />;
return <ProductList products={data} />;
```

---

## API 設計規範

### RESTful API 原則

1. **資源導向**: URL 代表資源，HTTP 方法代表操作
2. **統一介面**: 一致的 API 設計模式
3. **無狀態**: 每個請求包含所有必要資訊

### API 端點命名

```
GET    /api/products          # 獲取商品列表
GET    /api/products/:id      # 獲取單一商品
POST   /api/products           # 創建商品（管理員）
PUT    /api/products/:id       # 更新商品（管理員）
DELETE /api/products/:id       # 刪除商品（管理員）

GET    /api/orders             # 獲取訂單列表
GET    /api/orders/:id          # 獲取單一訂單
POST   /api/orders              # 創建訂單
PUT    /api/orders/:id/status   # 更新訂單狀態（管理員）

POST   /api/auth/register       # 註冊
POST   /api/auth/login         # 登入
POST   /api/auth/refresh        # 刷新 Token
POST   /api/auth/logout         # 登出
```

### 回應格式規範

```typescript
// 成功回應
{
  "success": true,
  "data": {
    // 實際數據
  },
  "message": "操作成功"
}

// 錯誤回應
{
  "success": false,
  "message": "錯誤訊息",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}

// 分頁回應
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 認證規範

1. **JWT Token**: 使用 Bearer Token
2. **Token 過期**: Access Token 15 分鐘，Refresh Token 7 天
3. **自動刷新**: 前端自動處理 Token 刷新

```typescript
// 請求頭格式
Authorization: Bearer <access_token>
```

---

## 資料庫規範

### Prisma Schema 規範

1. **模型命名**: PascalCase，單數形式
2. **欄位命名**: camelCase
3. **關聯命名**: 使用關聯模型名稱

```prisma
// ✅ 正確
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  orders    Order[]  // 關聯命名
}

// ❌ 錯誤
model users {
  user_id   String
  user_name String
}
```

### 資料庫遷移規範

1. **遷移命名**: 描述性名稱
2. **測試遷移**: 本地測試後再提交
3. **回滾準備**: 確保可以回滾

```bash
# 創建遷移
npx prisma migrate dev --name add_user_avatar

# 部署遷移（生產環境）
npx prisma migrate deploy
```

---

## 部署規範

### Render 後端部署

#### 基本配置

- **服務類型**: Web Service
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

#### 部署流程

1. **推送代碼到 GitHub**
2. **Render 自動檢測並部署**
3. **檢查環境變數**: 確認所有必需變數已設置
4. **檢查日誌**: 確認服務正常啟動
5. **測試 API**: 訪問 `/api/health` 確認服務運行

#### 常見問題

- **構建失敗**: 檢查 Node.js 版本（必須 >= 18.0.0）
- **啟動失敗**: 檢查環境變數和資料庫連接
- **CORS 錯誤**: 確認 `FRONTEND_URL` 環境變數正確

### Vercel 前端部署

#### 基本配置

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### 部署流程

1. **連接 GitHub 倉庫**
2. **設置環境變數**: 在 Vercel Dashboard 設置 `VITE_API_URL`
3. **自動部署**: 推送代碼後自動部署
4. **驗證部署**: 檢查瀏覽器控制台確認 API URL 正確

#### 常見問題

- **API 連接失敗**: 檢查 `VITE_API_URL` 環境變數
- **環境變數未生效**: 必須重新部署才能生效
- **構建失敗**: 檢查 Node.js 版本和依賴

---

## 安全規範

### 認證安全

1. **密碼雜湊**: 使用 bcrypt，至少 12 rounds
2. **JWT Secret**: 至少 32 字符，使用強隨機字符串
3. **Token 過期**: Access Token 15 分鐘，Refresh Token 7 天

### 輸入驗證

1. **所有輸入必須驗證**: 使用 Joi 或 Zod
2. **SQL 注入防護**: 使用 Prisma（自動防護）
3. **XSS 防護**: 使用 DOMPurify 清理用戶輸入

### CORS 配置

```typescript
// ✅ 正確：明確指定允許的來源
const allowedOrigins = [
  'https://your-frontend.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

// ❌ 錯誤：允許所有來源
origin: '*'
```

### 環境變數安全

1. **永遠不要提交 `.env` 文件**
2. **使用強密碼生成器生成 Secrets**
3. **定期輪換 API 密鑰**

---

## 測試規範

### 測試類型

1. **單元測試**: 測試單個函數或組件
2. **整合測試**: 測試 API 端點
3. **E2E 測試**: 測試完整用戶流程

### 測試覆蓋率目標

- **後端**: 至少 70% 覆蓋率
- **前端**: 至少 60% 覆蓋率
- **關鍵功能**: 100% 覆蓋率

### 測試命令

```bash
# 後端測試
cd backend
npm test              # 運行測試
npm run test:coverage # 測試覆蓋率

# 前端測試
cd frontend
npm test              # 運行測試
npm run test:coverage # 測試覆蓋率
```

---

## 常見問題與解決方案

### 環境變數問題

#### 問題 1: 前端無法連接到後端 API

**症狀**: 瀏覽器控制台顯示 `localhost:3001` 或 CORS 錯誤

**解決方案**:
1. 檢查 Vercel 環境變數 `VITE_API_URL` 是否設置
2. 確認值為 `https://your-backend-url.onrender.com/api`
3. 重新部署前端應用

#### 問題 2: 後端 CORS 錯誤

**症狀**: 瀏覽器顯示 CORS 錯誤

**解決方案**:
1. 檢查 Render 環境變數 `FRONTEND_URL` 是否設置
2. 確認值為完整的前端 URL（例如：`https://your-frontend.vercel.app`）
3. 檢查後端 CORS 配置是否包含該 URL
4. 重新部署後端服務

### 資料庫問題

#### 問題 1: 資料庫連接失敗

**解決方案**:
1. 檢查 `DATABASE_URL` 環境變數格式
2. 確認資料庫服務正在運行
3. 檢查網路連接和防火牆設置

#### 問題 2: Prisma 遷移失敗

**解決方案**:
1. 檢查資料庫連接
2. 確認遷移文件沒有語法錯誤
3. 嘗試手動運行 `npx prisma migrate deploy`

### 部署問題

#### 問題 1: Render 構建失敗

**解決方案**:
1. 檢查 Node.js 版本（必須 >= 18.0.0）
2. 檢查 `package.json` 中的腳本是否正確
3. 查看構建日誌找出具體錯誤

#### 問題 2: Vercel 部署失敗

**解決方案**:
1. 檢查構建命令是否正確
2. 確認所有依賴已正確安裝
3. 檢查 TypeScript 編譯錯誤

---

## 檢查清單

### 開發前檢查

- [ ] 環境變數已正確設置（本地 `.env` 或平台環境變數）
- [ ] 資料庫連接正常
- [ ] 依賴已安裝（`npm install`）
- [ ] 代碼規範檢查通過（`npm run lint`）
- [ ] 類型檢查通過（`npm run type-check`）

### 提交前檢查

- [ ] 代碼已通過 Lint 檢查
- [ ] 類型檢查通過
- [ ] 測試通過
- [ ] 沒有硬編碼的配置
- [ ] 環境變數使用正確

### 部署前檢查

- [ ] 所有環境變數已在平台設置（Render/Vercel）
- [ ] 資料庫遷移已執行
- [ ] API URL 配置正確
- [ ] CORS 配置正確
- [ ] 安全配置已檢查

---

## 參考資源

### 官方文檔

- [React 文檔](https://react.dev)
- [TypeScript 文檔](https://www.typescriptlang.org)
- [Prisma 文檔](https://www.prisma.io/docs)
- [Vite 文檔](https://vitejs.dev)
- [Render 文檔](https://render.com/docs)
- [Vercel 文檔](https://vercel.com/docs)

### 專案文檔

- `01_project_overview.md` - 專案總覽
- `03_frontend_architecture.md` - 前端架構
- `04_backend_architecture.md` - 後端架構
- `RENDER_DEPLOYMENT.md` - Render 部署指南
- `VERCEL_ENV_SETUP.md` - Vercel 環境變數設置

---

## 更新日誌

### v1.0.0 (2024-11-11)

- 初始版本
- 建立完整的開發規範
- 定義環境變數配置標準
- 制定代碼和 API 設計規範

---

**重要提醒**: 

1. **每次開發前請先閱讀此規範**
2. **環境變數必須在 Render 和 Vercel 平台設置，不要硬編碼**
3. **遇到問題先查看「常見問題與解決方案」**
4. **重大變更前請先確認並更新此規範文檔**

