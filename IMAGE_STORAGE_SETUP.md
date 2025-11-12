# 圖片存儲設置指南

## 當前配置

項目已配置使用 **Cloudinary** 作為圖片存儲服務。

## 推薦方案（初期使用）

### 🥇 推薦：Cloudinary（免費方案）

**優點：**
- ✅ 免費方案：25GB 存儲空間，25GB 月流量
- ✅ 自動圖片優化（壓縮、格式轉換）
- ✅ CDN 加速，全球分發
- ✅ 自動生成縮略圖
- ✅ 簡單易用，API 友好
- ✅ 已集成到項目中

**免費方案限制：**
- 25GB 存儲空間
- 25GB 月流量
- 單個文件最大 10MB
- 適合初期和小型項目

**設置步驟：**

1. **註冊 Cloudinary 帳號**
   - 訪問：https://cloudinary.com/users/register/free
   - 使用 Google/GitHub 快速註冊

2. **獲取 API 憑證**
   - 登入後進入 Dashboard
   - 複製以下信息：
     - `Cloud Name`
     - `API Key`
     - `API Secret`

3. **在 Render 設置環境變數**
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **測試上傳**
   - 使用管理後台的上傳功能
   - 圖片會自動上傳到 Cloudinary
   - URL 格式：`https://res.cloudinary.com/your-cloud-name/image/upload/...`

### 🥈 替代方案 1：ImgBB（完全免費）

**優點：**
- ✅ 完全免費，無限制
- ✅ 無需註冊（可選）
- ✅ 簡單的 API

**缺點：**
- ❌ 沒有 CDN
- ❌ 沒有自動優化
- ❌ 需要修改代碼

**適用場景：**
- 預算為零
- 圖片數量很少
- 不需要圖片優化

### 🥉 替代方案 2：AWS S3 + CloudFront

**優點：**
- ✅ 可擴展性強
- ✅ 成本低（按使用量付費）
- ✅ 企業級可靠性

**缺點：**
- ❌ 設置複雜
- ❌ 需要 AWS 帳號
- ❌ 需要修改代碼

**適用場景：**
- 大型項目
- 需要更多控制
- 有 AWS 經驗

### 🏅 替代方案 3：Supabase Storage

**優點：**
- ✅ 免費方案：1GB 存儲
- ✅ 與 Supabase 數據庫集成
- ✅ 簡單的 API

**缺點：**
- ❌ 免費方案存儲空間較小
- ❌ 需要修改代碼

## 當前項目配置

### 已實現的功能

1. **圖片上傳**
   - 單張圖片：`POST /api/upload/image`
   - 多張圖片：`POST /api/upload/images`（最多 10 張）

2. **圖片處理**
   - 自動壓縮（使用 Sharp）
   - 自動格式優化（JPEG/PNG/WebP）
   - 質量優化（80%）

3. **存儲位置**
   - Cloudinary 文件夾：`ecommerce/products`
   - 自動生成安全 URL

### 環境變數設置

在 Render 環境變數中添加：

```env
# Cloudinary 配置（必需）
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# 文件上傳設定（可選）
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

## 快速開始（Cloudinary）

### 步驟 1：註冊 Cloudinary

1. 訪問：https://cloudinary.com/users/register/free
2. 選擇免費方案
3. 完成註冊

### 步驟 2：獲取憑證

1. 登入 Dashboard：https://console.cloudinary.com/
2. 在 Dashboard 首頁可以看到：
   ```
   Cloud name: xxxxxx
   API Key: xxxxxx
   API Secret: xxxxxx (點擊顯示)
   ```

### 步驟 3：設置環境變數

在 Render Dashboard：
1. 選擇你的 Web Service
2. 點擊 "Environment" 標籤
3. 添加以下環境變數：

```
CLOUDINARY_CLOUD_NAME=你的-cloud-name
CLOUDINARY_API_KEY=你的-api-key
CLOUDINARY_API_SECRET=你的-api-secret
```

4. 點擊 "Save Changes"（會自動重新部署）

### 步驟 4：測試

1. 登入管理後台
2. 創建新商品
3. 上傳圖片
4. 檢查圖片是否成功上傳並顯示

## 圖片 URL 格式

上傳成功後，Cloudinary 會返回：

```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/ecommerce/products/xxxxx.jpg",
    "publicId": "ecommerce/products/xxxxx"
  }
}
```

這個 `url` 可以直接用於：
- 商品圖片
- 用戶頭像
- 分類圖片

## 常見問題

### Q: 免費方案夠用嗎？

**A:** 對於初期項目，25GB 通常足夠：
- 假設每張圖片 500KB
- 可以存儲約 50,000 張圖片
- 月流量 25GB 可以支持大量訪問

### Q: 超出免費額度怎麼辦？

**A:** 
1. 升級到付費方案（按使用量付費）
2. 遷移到其他服務（如 AWS S3）
3. 優化圖片大小和格式

### Q: 如何刪除圖片？

**A:** 
- 可以通過 Cloudinary API 刪除
- 或使用 Cloudinary Dashboard 手動刪除
- 建議實現刪除功能（當商品被刪除時）

### Q: 圖片上傳失敗？

**A:** 檢查：
1. 環境變數是否正確設置
2. API 憑證是否有效
3. 文件大小是否超過限制（10MB）
4. 文件格式是否支持（JPEG/PNG/WebP）

## 安全建議

1. **保護 API Secret**
   - 永遠不要提交到 Git
   - 只在環境變數中設置
   - 定期輪換

2. **限制上傳**
   - 設置文件大小限制
   - 限制文件類型
   - 驗證文件內容

3. **訪問控制**
   - 使用簽名 URL（可選）
   - 設置訪問權限
   - 定期清理未使用的圖片

## 下一步

1. ✅ 註冊 Cloudinary 帳號
2. ✅ 獲取 API 憑證
3. ✅ 在 Render 設置環境變數
4. ✅ 重新部署後端
5. ✅ 測試圖片上傳功能

完成後，你就可以在管理後台上傳商品圖片了！


