# 圖標轉換指南 - 生成 PNG 格式

Facebook 只接受 **PNG、JPG、GIF** 格式，不接受 SVG。以下是幾種轉換方法：

## 🚀 方法一：使用瀏覽器工具（最簡單，推薦）

1. **打開轉換工具**
   - 在瀏覽器中打開：`frontend/public/convert-icon.html`
   - 或直接雙擊該文件

2. **載入圖標**
   - 點擊「載入簡約版圖標」按鈕

3. **轉換並下載**
   - 點擊「轉換為 PNG (1024x1024) - Facebook 要求」按鈕
   - 圖標會自動下載為 `app-icon-1024x1024.png`

4. **上傳到 Facebook**
   - 在 Facebook Developers Console 中
   - 找到「應用程式圖示 (1024 x 1024)」欄位
   - 上傳下載的 PNG 文件

## 💻 方法二：使用 Node.js 腳本（需要安裝依賴）

### 步驟 1：安裝 sharp 庫

```bash
cd frontend
npm install --save-dev sharp
```

### 步驟 2：運行轉換腳本

```bash
npm run convert-icon
```

這會生成兩個文件：
- `frontend/public/app-icon-512x512.png`
- `frontend/public/app-icon-1024x1024.png` ← **使用這個上傳到 Facebook**

## 🌐 方法三：使用線上工具（無需安裝任何東西）

### 選項 A：CloudConvert

1. 訪問 [CloudConvert SVG to PNG](https://cloudconvert.com/svg-to-png)
2. 上傳 `frontend/public/app-icon-simple.svg`
3. 設置：
   - **寬度**: 1024 像素
   - **高度**: 1024 像素
4. 點擊「轉換」
5. 下載 PNG 文件

### 選項 B：Convertio

1. 訪問 [Convertio SVG to PNG](https://convertio.co/svg-png/)
2. 上傳 `frontend/public/app-icon-simple.svg`
3. 在「進階選項」中設置尺寸為 1024x1024
4. 轉換並下載

## 📋 Facebook 圖標要求

- ✅ **尺寸**: 1024 x 1024 像素（必須）
- ✅ **格式**: PNG、JPG 或 GIF
- ✅ **檔案大小**: 建議小於 5MB
- ✅ **設計**: 正方形、清晰、符合品牌

## 🎨 圖標設計說明

已創建的圖標：
- **簡約版** (`app-icon-simple.svg`): 黑色背景 + 白色粗體 "E" + "STORE" 文字
- **完整版** (`app-icon.svg`): 包含購物袋裝飾

**推薦使用簡約版**，因為：
- 更清晰易識別
- 在小尺寸下也能清楚顯示
- 符合現代設計趨勢

## ⚠️ 常見問題

### Q: 為什麼 Facebook 不接受 SVG？
A: Facebook 的系統只支援點陣圖格式（PNG/JPG/GIF），不支援向量圖（SVG）。

### Q: 512x512 可以嗎？
A: Facebook 要求 **1024x1024**，但系統會自動縮放。建議使用 1024x1024 以獲得最佳品質。

### Q: 可以修改圖標設計嗎？
A: 可以！編輯 `frontend/public/app-icon-simple.svg` 文件，然後重新轉換為 PNG。

## 📁 文件位置

- SVG 源文件: `frontend/public/app-icon-simple.svg`
- 轉換工具: `frontend/public/convert-icon.html`
- Node.js 腳本: `frontend/scripts/convert-icon.js`
- 生成的 PNG: `frontend/public/app-icon-1024x1024.png`

## ✅ 快速檢查清單

- [ ] 已生成 1024x1024 的 PNG 文件
- [ ] 文件格式為 PNG
- [ ] 圖標清晰可見
- [ ] 已上傳到 Facebook Developers Console
- [ ] Facebook 已接受圖標

---

**推薦流程**: 使用方法一（瀏覽器工具），最簡單快速！


