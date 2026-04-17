# Sun 結果頁設計紀錄

## 素材清單與用途

| 檔名 | 用途 | 說明 |
|------|------|------|
| `太陽.jpg` | 整頁背景 | 1920×7401px，撐滿整頁高度 |
| `資產 28.png` | 布條（固定底部） | 橘黃漸層條，logos 疊在上面 |
| `資產 29.png` | 白色吉他 blob | 2236×2242px，layout editor 控制位置大小 |
| `hero-card.webp` | Hero 結果卡 | 最上方主視覺卡片 |
| `char.webp` | 角色圖 | 33MB，可能是動態 WebP |
| `char-right.webp` | 右側裝飾 | 絕對定位 |
| `char-type.webp` | 角色型標籤 | floating 動畫 |
| `personality-card.webp` | 個人特質卡 | |
| `city-card.webp` | 城市卡 | |
| `guitar-1/2.webp` | Ayers 吉他款式 | 兩欄排列 |
| `btn-unlock-1/2.webp` | 解鎖按鈕 | |
| `tag-1~4.webp` | 音樂風格標籤 | 4 個 stagger 動畫 |
| `poster.webp` | 比賽海報 | |
| `text-save.webp` | 長按儲存提示 | |
| `text-scroll.webp` | 往下看提示 | |
| `text-chance.webp` | 一個讓你被聽見的機會 | |
| `text-guess.webp` | 猜猜這是哪 | |
| `text-sound.webp` | 發出什麼樣的聲音 | |
| `text-heard.webp` | 你聽出來了嗎 | |
| `text-contest-info.webp` | 比賽資訊文字 | |
| `title-ayers.webp` | Ayers 吉他款式標題 | |
| `title-music-style.webp` | 音樂風格標題 | |
| `btn-share.webp` | 分享按鈕 | 金光閃爍動畫 |
| `btn-retry.webp` | 再測一次 | |
| `btn-contest.webp` | 前往比賽 | |
| `ayers.png` | Ayers logo（footer） | |
| `協辦 聲潮.png` | 協辦 logo | footer |
| `協辦91譜.png` | 協辦 logo | footer |
| `協辦 生為吉他人 死為吉他魂.png` | 協辦 logo | footer |
| `贊助 雲聲.png` | 贊助 logo | footer |
| `贊助 奧昇.png` | 贊助 logo | footer |

---

## 圖層結構（由底到頂）

```
1. 太陽.jpg（1920×7401）— 整頁 CSS background，backgroundSize: '100% 100%'
2. 所有內容素材（layout editor 自由調整）
3. 資產 29（白色吉他 blob）— layout editor 控制，footerBlob key
4. 資產 28（橘色布條）— 固定在最底部，不可移動
5. Logos（主辦方/協辦/贊助）— 疊在布條上
```

---

## Layout Editor 使用方式

URL: `/e/soul-guitar/sun?edit=<admin_key>`

- **所有素材**：W（寬度%）、mt（上距 px）、x/y（偏移 px）、z（圖層）
- **範圍**：W 0~200%，mt ±600px，x/y ±300px（刻意放大讓設計師自由調整）
- **底部吉他**（`footerBlob`）：W 0~200%，mt ±600px
- **儲存**：右側面板「儲存到資料庫」

---

## 固定不動的元素

- **資產 28 布條** 永遠釘在頁面最底部
- **Logos**（主辦/協辦/贊助）疊在布條上，不受 layout editor 影響

---

## 背景注意事項

- `太陽.jpg` 是 1920×7401，設計用來撐滿整頁
- `backgroundSize: '100% 100%'` → 隨容器高度等比拉伸
- 外層 div 做 `backgroundColor` fallback（#FF9A3E）避免留白
- 背景設在**外層 full-width div**，content 在內層 `max-w-[430px]`

---

## 響應式

- 頁面容器：`max-w-[430px]` 手機優先
- 桌機：內容置中，兩側顯示 themeColor（#FF9A3E）
- 所有素材 `W %` 基於 430px 容器計算
