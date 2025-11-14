# 應用程式圖標生成指南

## 已創建的圖標文件

我已經為您創建了兩個版本的應用程式圖標：

### 1. `frontend/public/app-icon-simple.svg` (推薦)
- **簡約版設計**
- 黑色背景 + 白色粗體 "E" 字母
- 底部有 "STORE" 文字
- 適合 Facebook 應用圖標

### 2. `frontend/public/app-icon.svg`
- **完整版設計**
- 包含購物袋圖標裝飾
- 更複雜的設計

## 轉換為 PNG 的方法

### 方法一：使用提供的 HTML 工具（最簡單）

1. 在瀏覽器中打開 `frontend/public/convert-icon.html`
2. 點擊「載入簡約版圖標」或「載入完整版圖標」
3. 點擊「轉換為 PNG (512x512)」
4. 圖標會自動下載為 `app-icon-512x512.png`

### 方法二：使用線上工具

1. 訪問 [CloudConvert](https://cloudconvert.com/svg-to-png) 或 [Convertio](https://convertio.co/svg-png/)
2. 上傳 `app-icon-simple.svg`
3. 設置輸出尺寸為 512x512 像素
4. 下載 PNG 文件

### 方法三：使用 ImageMagick（命令行）

```bash
# 安裝 ImageMagick（如果尚未安裝）
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# 轉換為 PNG
magick convert -background none -resize 512x512 frontend/public/app-icon-simple.svg app-icon-512x512.png
```

### 方法四：使用 Inkscape（圖形界面）

1. 下載並安裝 [Inkscape](https://inkscape.org/)
2. 打開 `app-icon-simple.svg`
3. 文件 → 匯出為 PNG
4. 設置寬度和高度為 512 像素
5. 匯出

## Facebook 應用圖標要求

- **尺寸**: 1024 x 1024 像素（Facebook 要求）
- **格式**: PNG 或 JPG
- **建議**: 使用正方形、清晰的設計

### 生成 1024x1024 版本

如果您需要 1024x1024 的版本（Facebook 實際要求），可以使用以下方法：

**使用 HTML 工具修改：**
在 `convert-icon.html` 中，將 canvas 尺寸改為 1024x1024，然後轉換。

**使用 ImageMagick：**
```bash
magick convert -background none -resize 1024x1024 frontend/public/app-icon-simple.svg app-icon-1024x1024.png
```

## 自定義圖標

如果您想修改圖標設計，可以編輯 SVG 文件：

- 修改顏色：更改 `fill` 屬性
- 修改文字：更改 `<text>` 標籤內容
- 修改大小：調整 `font-size` 屬性
- 添加圖形：在 SVG 中添加更多元素

## 上傳到 Facebook

1. 在 Facebook Developers Console 中
2. 找到「應用程式圖示 (1024 x 1024)」欄位
3. 點擊上傳按鈕
4. 選擇生成的 PNG 文件（1024x1024 或 512x512，Facebook 會自動調整）
5. 保存設定

## 注意事項

- 確保圖標在深色和淺色背景下都清晰可見
- 避免使用過於複雜的設計
- 保持品牌一致性
- 測試圖標在小尺寸下的顯示效果


