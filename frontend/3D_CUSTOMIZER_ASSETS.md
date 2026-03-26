# 3D 吉他客製化器 — 素材需求清單

> 目標：達到遊戲級的 3D 配置器體驗
> 像 Porsche / Tesla 車輛配置器、或遊戲角色創建器的品質

---

## 🔴 必要素材（沒有就做不好）

### 1. 高品質分部件 3D 吉他模型

**目前問題**：Meshy AI 生成的模型只有 1 個 mesh，無法分別對各部位上色/換材質/切換視角。

**需求**：一把完整的木吉他 3D 模型（.glb 或 .gltf），**必須包含以下獨立部件（分開的 mesh）**：

| 部件名稱 | Mesh 命名建議 | 用途 |
|---------|-------------|------|
| 面板（Top） | `Top_Body` | 換面板木紋材質 |
| 背板（Back） | `Back_Body` | 換背板木紋材質 |
| 側板（Sides） | `Side_Body` | 跟背板同材質 |
| 琴頸（Neck） | `Neck` | 換琴頸木材質 |
| 指板（Fingerboard） | `Fingerboard` | 換指板材質（玫瑰木/烏木/楓木） |
| 琴頭（Headstock） | `Headstock` | 展示 Logo 和弦鈕 |
| 琴橋（Bridge） | `Bridge` | 跟指板同材質 |
| 弦鈕（Tuners） | `Tuners` | 換金屬色（Chrome/Gold/Black） |
| 弦（Strings） | `Strings` | 金屬色 |
| 琴枕（Nut） | `Nut` | 白色/骨色 |
| 下弦枕（Saddle） | `Saddle` | 白色/骨色 |
| 包邊（Binding） | `Binding` | 換包邊材質/顏色 |
| 音孔環（Rosette） | `Rosette` | 換裝飾圖案 |
| 指板鑲嵌（Inlays） | `Inlays` | 換鑲嵌材質 |
| 護板（Pickguard）| `Pickguard` | 可選配件 |

**技術要求**：
- 格式：`.glb`（GLTF Binary）
- 面數：5,000 ~ 30,000 面（Web 適用，不需要百萬面）
- **必須有 UV 展開**（UV Mapping） — 這樣材質貼圖才能正確貼合
- 建議準備 2 個版本：Cutaway（缺角）和 Non-Cutaway
- 如有不同桶身（Dreadnought / GA / OM），每種各一個模型

**製作建議**：
- 找 3D 建模師（Fiverr / 台灣接案平台），費用約 USD $200-500
- 提供你的吉他實拍照片（正面、背面、側面、琴頭特寫）作為參考
- 或使用 Blender + 參考圖自己建模
- Sketchfab 上也有付費的吉他模型可以購買後修改

---

### 2. 木材材質貼圖（Texture Maps）

每種木材需要 3 張貼圖，尺寸建議 1024x1024 或 2048x2048：

| 木材 | Diffuse（顏色） | Normal（凹凸） | Roughness（粗糙度） |
|------|----------------|---------------|-------------------|
| Sitka Spruce 西堤卡雲杉 | ✅ 需要 | ✅ 需要 | ✅ 需要 |
| Adirondack Spruce 阿迪朗達克雲杉 | ✅ 需要 | ✅ 需要 | ✅ 需要 |
| Western Red Cedar 紅杉 | ✅ 需要 | ✅ 需要 | ✅ 需要 |
| Engelmann Spruce 恩格曼雲杉 | ✅ 需要 | ✅ 需要 | ✅ 需要 |
| Indian Rosewood 印度玫瑰木 | ✅ 需要 | ✅ 需要 | ✅ 需要 |
| Mahogany 桃花心木 | ✅ 需要 | ✅ 需要 | ✅ 需要 |
| Flame Maple 火焰楓木 | ✅ 需要 | ✅ 需要 | ✅ 需要 |
| Hawaiian Koa 夏威夷相思木 | ✅ 需要 | ✅ 需要 | ✅ 需要 |
| Cocobolo 可可波羅 | ✅ 需要 | ✅ 需要 | ✅ 需要 |
| Brazilian Rosewood 巴西玫瑰木 | ✅ 需要 | ✅ 需要 | ✅ 需要 |
| Ebony 烏木 | ✅ 需要 | ✅ 需要 | ✅ 需要 |

**共 11 種木材 × 3 張 = 33 張貼圖**

**取得方式（任選）**：
- **A. 拍攝你的實際木材**：近拍木材表面（平光、正面），我用 AI 工具轉成 Normal + Roughness map
- **B. 購買現成貼圖**：[Poliigon](https://www.poliigon.com/textures/wood)、[ambientCG](https://ambientcg.com/categories/Wood)（免費 CC0）
- **C. 我用程式生成** Procedural texture（效果比真實照片差一些，但可先用）

---

### 3. 金屬材質（弦鈕用）

| 材質 | 說明 |
|------|------|
| Chrome 鍍鉻 | 高反射銀色 |
| Gold 鍍金 | 暖金色 |
| Black Chrome 黑鉻 | 暗色金屬 |

這些可以用程式設定（調整 metalness + roughness + color），不需要貼圖。

---

### 4. 裝飾材質貼圖

| 素材 | 用途 | 說明 |
|------|------|------|
| 鮑魚貝 Abalone 貼圖 | 鑲嵌 & 音孔環 & 包邊 | 彩虹色閃光的貝殼紋理 |
| 珍珠母貝 Mother of Pearl 貼圖 | 鑲嵌 | 白色帶彩虹光澤 |
| 木質馬賽克 Wood Mosaic 貼圖 | 音孔環 | 幾何木片拼花圖案 |

---

## 🟡 進階素材（讓體驗更好）

### 5. 不同桶身的 3D 模型

如果預算允許，準備多個桶身造型：

| 桶身 | 說明 |
|------|------|
| Dreadnought | 最大最經典 |
| Grand Auditorium (GA) | 中等，最通用 |
| Orchestra Model (OM) | 較小，指彈用 |
| Parlor | 最小，復古 |
| Super Jumbo (SJ) | 超大，舞台用 |

每個桶身需要 Cutaway 和 Non-Cutaway 兩個版本 = **最多 10 個模型**

> 💡 **最小可行方案**：先做 1 個 GA Cutaway 模型，其他桶身用同一個模型但標注「僅示意」

### 6. HDRI 環境貼圖

- 一張工坊/展示間風格的 HDRI（`.hdr` 格式）
- 用途：讓 3D 場景的反射和光影更真實
- 建議來源：[Poly Haven](https://polyhaven.com/hdris)（免費 CC0）
- 我目前用的是 Three.js 內建的 "studio" preset，夠用但不夠獨特

---

## 🟢 可選素材

### 7. 音效

| 音效 | 用途 |
|------|------|
| 木頭敲擊聲 | 選擇木材時的回饋音 |
| 金屬撥弦聲 | 選擇弦鈕/拾音器時 |
| 成功音效 | 提交報價時 |

### 8. Ayers Logo 3D

- Logo 的 3D 浮雕版本（用於琴頭上的品牌展示）
- 或提供高解析度 Logo PNG，我做成 decal 貼在琴頭

---

## 製作流程建議

```
第 1 步：3D 模型（最重要）
   └─ 找建模師，提供你的吉他照片作參考
   └─ 要求分部件命名 + UV 展開 + .glb 輸出
   └─ 預算：USD $200-500，時間：1-2 週

第 2 步：木材貼圖
   └─ 方案 A：拍攝實際木材 → 我轉成 PBR 貼圖組
   └─ 方案 B：ambientCG 免費下載
   └─ 方案 C：我先用 Procedural 生成佔位

第 3 步：我整合到網站
   └─ 載入分部件模型
   └─ 每個部件綁定對應的材質槽
   └─ 選擇木材時即時切換貼圖
   └─ 鏡頭自動對準正在編輯的部件
   └─ 預計整合時間：2-3 小時
```

---

## 最終效果

有了以上素材，配置器能做到：

- ✅ 選面板木材 → 鏡頭轉到正面 → 面板即時換上真實木紋
- ✅ 選背側板 → 鏡頭轉到背面 → 背板換上玫瑰木/楓木/Koa 紋理
- ✅ 選指板 → 鏡頭俯視指板 → 烏木/玫瑰木/楓木切換
- ✅ 選弦鈕 → 鏡頭對準琴頭 → Chrome/Gold/Black 金屬質感
- ✅ 選包邊 → 鮑魚貝閃光效果即時呈現
- ✅ 選漆面 → 亮光/消光/開放漆孔的 roughness 即時變化
- ✅ 完成後 → 360° 自動旋轉展示你的客製吉他

> 準備好素材後告訴我，我會在幾小時內整合完成。
