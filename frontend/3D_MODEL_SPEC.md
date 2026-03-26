# Ayers Guitars — 3D 客製化模型規格書

## 專案說明
為 Ayers Guitars 網站的 3D 即時客製化工具製作吉他模型。
使用者可以在瀏覽器中即時切換面板、背側板、琴頸、指板、琴頭等部件的材質。
技術框架：React Three Fiber (Three.js)，模型格式 `.glb`。

---

## 需要的琴身型號（共 5 種）

| # | 型號 | 說明 | 參考 |
|---|------|------|------|
| 1 | **Dreadnought (D)** | 標準大琴身，無缺角 + 有缺角各一 | Martin D-28 比例 |
| 2 | **Grand Auditorium (GA)** | 中大琴身，無缺角 + 有缺角各一 | Taylor 214ce 比例 |
| 3 | **Orchestra Model (OM)** | 中型琴身，無缺角 + 有缺角各一 | Martin OM-28 比例 |
| 4 | **Parlor** | 小琴身，無缺角 + 有缺角各一 | 傳統 Parlor 比例 |
| 5 | **Super Jumbo (SJ)** | 超大琴身，無缺角 + 有缺角各一 | Gibson SJ-200 比例 |

**共 10 個模型檔**（5 型 × 2 缺角選項）

---

## 部件分離規格（關鍵！）

每個模型必須將以下部件作為**獨立的 mesh/object**，使用以下命名：

```
guitar-{型號}-{cutaway}.glb

模型內部 mesh 命名：
├── Top          ← 面板（雲杉/紅松面板，最大的可見面）
├── Back         ← 背板
├── Sides        ← 側板（左右側板）
├── Neck         ← 琴頸（不含指板）
├── Fingerboard  ← 指板（含琴格線）
├── Headstock    ← 琴頭
├── Bridge       ← 琴橋
├── BridgePins   ← 弦釘（6 顆可以是一個群組）
├── Nut          ← 上弦枕
├── Saddle       ← 下弦枕
├── Tuners       ← 旋鈕/弦鈕（6 個可以是一個群組）
├── Strings      ← 琴弦（6 條）
├── Rosette      ← 口輪圈（音孔裝飾環）
├── Binding      ← 鑲邊（面板邊緣、背板邊緣）
├── Pickguard    ← 護板（可選，部分型號沒有）
└── Inlays       ← 指板鑲嵌記號（圓點/鮑魚等）
```

---

## 技術規格

### 幾何
- **面數**：每個模型 30,000 - 60,000 三角面（瀏覽器即時渲染需要）
- **不要**超過 80,000 面
- 確保所有 mesh 有正確的 **UV 展開**（用於貼圖映射）
- 面板和背板的 UV 要盡量平整展開，讓木紋方向正確

### 尺寸
- 模型整體高度約 **3-4 個 Three.js 單位**（約等於 3-4 米在場景中）
- 原點 (0,0,0) 設在琴身中心
- Y 軸朝上，琴頭在上方

### 材質
- **不需要**內建材質/貼圖（我們會在程式中動態指定）
- 每個 mesh 只需要**預設白色或灰色材質**
- 確保每個 mesh 是**獨立材質插槽**（不同部件不共享材質）

### 匯出
- 格式：**GLB**（GLTF Binary）
- 壓縮：使用 Draco 壓縮
- 每個檔案目標 **2-4 MB**
- 命名：`guitar-d.glb`, `guitar-dc.glb`, `guitar-ga.glb`, `guitar-gac.glb`, `guitar-om.glb`, `guitar-omc.glb`, `guitar-parlor.glb`, `guitar-parlorc.glb`, `guitar-sj.glb`, `guitar-sjc.glb`

---

## 琴頭形狀（額外需求）

如果可能，提供 2-3 種不同琴頭形狀作為**可替換部件**：

| 琴頭 | 說明 |
|------|------|
| Standard | Ayers 標準琴頭（圓弧形） |
| Slotted | 古典開槽式琴頭 |
| Pointed | 尖頭設計 |

這些可以是獨立的 `.glb` 部件檔，程式中動態替換。

---

## 參考圖片

請參考 Ayers 官網的產品照片：
- https://ayersguitars.com/products.html
- 各系列產品可看到不同琴身比例

重點注意：
- Ayers 的琴身曲線比較柔和圓潤
- 口輪圈（Rosette）是重要的裝飾特色
- 琴橋使用燕尾式設計

---

## 交付檢查清單

- [ ] 10 個 .glb 模型檔（5 型 × 2）
- [ ] 每個模型內部 mesh 按規格命名
- [ ] 每個 mesh 有獨立材質插槽
- [ ] UV 展開正確（面板/背板木紋方向對）
- [ ] 面數在 30K-60K 之間
- [ ] Draco 壓縮，單檔 2-4MB
- [ ] 琴弦有正確的張力弧度
- [ ] 琴格間距符合真實比例
