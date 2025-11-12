# Vercel 環境變量設置指南

## 問題說明

前端應用部署在 Vercel 後，如果沒有設置 `VITE_API_URL` 環境變量，會默認使用 `http://localhost:3001/api`，導致無法連接到生產環境的後端 API。

## 解決方案

### 步驟 1: 進入 Vercel 項目設置

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的項目：`ecommerce-frontend-liard-omega`
3. 點擊項目進入項目詳情頁

### 步驟 2: 添加環境變量

1. 點擊頂部導航欄的 **"Settings"**
2. 在左側菜單中點擊 **"Environment Variables"**
3. 點擊 **"Add New"** 按鈕

### 步驟 3: 設置環境變量

添加以下環境變量：

- **Key**: `VITE_API_URL`
- **Value**: `https://ecommerce-1w9j.onrender.com/api`
- **Environment**: 選擇所有環境（Production, Preview, Development）

點擊 **"Save"** 保存

### 步驟 4: 重新部署

環境變量添加後，需要重新部署應用：

1. 點擊頂部導航欄的 **"Deployments"**
2. 找到最新的部署記錄
3. 點擊右側的 **"..."** 菜單
4. 選擇 **"Redeploy"**
5. 確認重新部署

或者，你可以：
- 推送一個新的 commit 到 GitHub（會自動觸發部署）
- 或者手動觸發部署

## 驗證

部署完成後，訪問前端應用：
1. 打開瀏覽者開發者工具（F12）
2. 查看 **Console** 標籤，應該看到：
   ```
   🌐 Production API URL: https://ecommerce-1w9j.onrender.com/api
   🌐 VITE_API_URL from env: https://ecommerce-1w9j.onrender.com/api
   ```
3. 查看 **Network** 標籤
4. 檢查 API 請求是否指向 `https://ecommerce-1w9j.onrender.com/api`

**如果仍然看到 `localhost:3001`**：
- 檢查 Console 中的環境變量值
- 如果顯示 `NOT SET`，說明環境變量沒有正確設置
- 確認已經重新部署應用

## 當前配置

- **前端 URL**: https://ecommerce-frontend-liard-omega.vercel.app/
- **後端 API URL**: https://ecommerce-1w9j.onrender.com/api
- **環境變量名稱**: `VITE_API_URL`
- **環境變量值**: `https://ecommerce-1w9j.onrender.com/api`

## 注意事項

1. **Vite 環境變量規則**: 只有以 `VITE_` 開頭的環境變量才會暴露給客戶端代碼
2. **重新部署**: 修改環境變量後必須重新部署才能生效
3. **不同環境**: 可以為 Production、Preview、Development 設置不同的值

## 故障排除

如果設置後仍然無法連接：

1. **檢查環境變量是否正確設置**:
   - 確認 Key 是 `VITE_API_URL`（大小寫敏感）
   - 確認 Value 是 `https://ecommerce-1w9j.onrender.com/api`（包含 `/api`）

2. **檢查是否重新部署**:
   - 環境變量修改後必須重新部署
   - 查看部署日誌確認環境變量已注入

3. **檢查後端是否運行**:
   - 訪問 https://ecommerce-1w9j.onrender.com/
   - 應該看到 `{"message":"E-commerce API Server",...}`

4. **檢查瀏覽器控制台**:
   - 打開開發者工具（F12）
   - 查看 Console 和 Network 標籤
   - 檢查錯誤信息

