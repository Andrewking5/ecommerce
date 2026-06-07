/* ═══════════════════════════════════════════════════════════════
   靈魂吉他手大賽 — 活動簡章內容（單一資料來源）
   SoulGuitarInfo.tsx（前台渲染）與 admin EventsTab.tsx（後台編輯器）
   都引用此檔。內容存於 Event.metadata.content；當 metadata 為空時，
   mergeInfoContent() 會回退到這些預設值，使線上頁面維持與現狀一致。
   ═══════════════════════════════════════════════════════════════ */

export interface InfoStripItem { label: string; value: string }
export interface StepItem { title: string; desc: string }
export interface JudgeItem { name: string; title: string; photo: string; link: string; posClass: string }
export interface ScoreItem { label: string; desc: string; pct: number }
export interface BigAward { icon: string; title: string; type: string; guitar: string; money: string; bonus: string; method: string; color: string }
export interface MidAward { icon: string; title: string; guitar: string; extra: string; micDetail: string; money: string; method: string; color: string }
export interface SpecialAward { icon: string; title: string; n: string; prize: string; note: string }
export interface VideoGroup { name: string; num: string; accent: string; ytTitle: string; hashtag: string }
export interface DemoVideo { embedUrl: string; title: string; desc: string }

export interface InfoContent {
  hero: {
    badge: string;
    title1: string;
    title2: string;
    subtitle: string;
    startLabel: string;
    startValue: string;
    endLabel: string;
    endValue: string;
    countdownTarget: string;
    note1: string;
    note2: string;
    poster: string;
    registerText: string;
    quizText: string;
  };
  infoStrip: InfoStripItem[];
  purpose: { title: string; lead: string; body: string };
  steps: { title: string; subtitle: string; items: StepItem[] };
  judges: { title: string; subtitle: string; items: JudgeItem[] };
  scoring: {
    title: string;
    subtitle: string;
    singingTitle: string;
    singing: ScoreItem[];
    playingTitle: string;
    playing: ScoreItem[];
    note: string;
  };
  awards: {
    title: string;
    subtitle: string;
    big: BigAward[];
    mid: MidAward[];
    special: SpecialAward[];
  };
  videoFormat: {
    title: string;
    groups: VideoGroup[];
    openingTitle: string;
    opening: string;
  };
  demoVideos: { title: string; subtitle: string; landscape: DemoVideo; portrait: DemoVideo };
  playlist: { text: string; buttonText: string; url: string };
  notes: { title: string; items: string[] };
  cta: { title: string; subtitle: string; igUrl: string; fbUrl: string };
}

export const DEFAULT_INFO_CONTENT: InfoContent = {
  hero: {
    badge: '2026 Soul Guitar Competition',
    title1: '靈魂吉他手',
    title2: '大賽',
    subtitle: '大聲點，讓世界聽見你的聲音！拿起手中那一把吉他，展現你的靈魂性格。',
    startLabel: '收件開始',
    startValue: '4.22',
    endLabel: '截止日期',
    endValue: '6.07',
    countdownTarget: '2026-06-07T23:59:00+08:00',
    note1: '報名上限 200 位 · 額滿為止',
    note2: '即日起報名就送 AYERS 吉他折價券！',
    poster: '/images/events/soul-guitar-poster.webp',
    registerText: '立即報名',
    quizText: '心理測驗',
  },
  infoStrip: [
    { label: '比賽平台', value: 'YouTube + IG 或 FB' },
    { label: '評審時間', value: '6/8 – 6/17' },
    { label: '得獎公佈', value: '6/29 21:00' },
    { label: '影片長度', value: '30 – 120 秒' },
  ],
  purpose: {
    title: '大賽宗旨',
    lead: '拿起手中的吉他，展現你的靈魂性格。',
    body: '在短影音時代，各式吉他彈唱與演奏內容蓬勃發展，音樂創作與推廣不像以往需要高成本與大量人力。\n現今吉他手除了精進琴藝與歌藝，更需要經營網路社群。\nAyers 特此舉辦本次比賽，號召世界各地琴友在線上相聚，展現最獨特的風格。',
  },
  steps: {
    title: '活動參賽流程',
    subtitle: 'How to Join',
    items: [
      { title: '心理測驗', desc: '完成心理測驗，測出你的吉他靈魂' },
      { title: '拍攝影片', desc: '穿上你測驗結果對應的「靈魂顏色」服裝，拍攝你的參賽影片' },
      { title: '上傳影片', desc: '上傳至 YouTube（必須）及 IG / FB（擇一）' },
      { title: '填寫表單', desc: '填寫報名表單，完成報名' },
      { title: '收到 Email', desc: '收到報名成功 Email，即完成參賽' },
    ],
  },
  judges: {
    title: '評審陣容',
    subtitle: '5 位音樂人共同評選',
    items: [
      { name: '四分衛－虎神', title: '四分衛樂團 吉他手/團長', photo: '/images/events/judges/hushen.webp?v=2', link: 'https://www.instagram.com/quarterback_band/', posClass: 'object-center' },
      { name: 'PiA 吳蓓雅', title: '創作歌手', photo: '/images/events/judges/pia.webp?v=2', link: 'https://www.instagram.com/piaxstudio/', posClass: 'object-top' },
      { name: 'JOYCE 就以斯', title: '創作歌手', photo: '/images/events/judges/joyce.webp?v=2', link: 'https://www.instagram.com/joyce.ch0627/', posClass: 'object-center' },
      { name: '林小歐', title: '職業樂手', photo: '/images/events/judges/linxiaoou.webp?v=2', link: 'https://www.instagram.com/novsherry?igsh=a2NjaXFrcXN5Z2Mz', posClass: 'object-center' },
      { name: '張仲麟', title: '指彈吉他演奏家', photo: '/images/events/judges/zhangzhonglin.webp?v=2', link: 'https://www.instagram.com/chang.chung.lin?igsh=Mjd3aG5mbWprd2Z4', posClass: 'object-top' },
    ],
  },
  scoring: {
    title: '評分標準',
    subtitle: 'Scoring Criteria',
    singingTitle: '彈唱組',
    singing: [
      { label: 'Vocal', desc: '音準、動態、聲音表現', pct: 35 },
      { label: '吉他', desc: '內聲部編排、節奏感', pct: 30 },
      { label: '融合度', desc: 'Vocal 和吉他搭配協調性', pct: 10 },
      { label: '影音呈現', desc: '錄音品質、影像品質', pct: 15 },
      { label: '風格特色', desc: '畫面、服裝、場景', pct: 10 },
    ],
    playingTitle: '演奏組',
    playing: [
      { label: '技巧', desc: '音色、精準度', pct: 40 },
      { label: '音樂性', desc: '旋律、和聲、節奏呈現', pct: 35 },
      { label: '影音呈現', desc: '錄音品質、影像品質', pct: 15 },
      { label: '風格特色', desc: '畫面、服裝、場景', pct: 10 },
    ],
    note: '最佳彈唱/演奏/吉他手/Vocal 由評審評分 · 人氣獎由社群讚數 · 評審優選由各評審選出',
  },
  awards: {
    title: '獎項',
    subtitle: 'AWARDS — 總價值超過 NT$200,000',
    big: [
      { icon: '🏆', title: '最佳彈唱獎', type: '全單吉他', guitar: 'A07c-30th Anniversary', money: '48,800', bonus: '5,000', method: '五位評審共同評分', color: '#facc15' },
      { icon: '🎸', title: '最佳演奏獎', type: '全單吉他（英格曼雲杉版）', guitar: 'A07c-30th-Engelmann Anniversary', money: '48,800', bonus: '5,000', method: '五位評審共同評分', color: '#f97316' },
    ],
    mid: [
      { icon: '🌟', title: '最佳吉他手', guitar: 'A07c Sun 全單吉他', extra: '+ 雲聲錄音電容麥克風', micDetail: 'SonoFlex 樂器麥克風　NT$9,990', money: '42,000', method: '評審評分', color: '#c5a059' },
      { icon: '🎤', title: '最佳 Vocal', guitar: 'A02c Sun 全單吉他', extra: '+ 聲潮錄音電容麥克風', micDetail: 'ST-K8　NT$9,800', money: '26,000', method: '評審評分', color: '#3b82f6' },
      { icon: '❤️', title: '最佳人氣獎', guitar: 'ST2-Color Light 面單彩色吉他', extra: '', micDetail: '', money: '15,500', method: 'FB/IG 讚數最高', color: '#ef4444' },
    ],
    special: [
      { icon: '🏅', title: '評審團優選', n: '5 位', prize: 'AYERS 與評審獎牌、吉他架與奧昇弦釘', note: '五位評審各自選出' },
      { icon: '🐴', title: '海馬特別獎', n: '3 位', prize: '一年海馬91PU會員', note: '由海馬執行長王翰選出' },
    ],
  },
  videoFormat: {
    title: '影片格式',
    groups: [
      { name: '演奏組上傳規則', num: '1.', accent: '#f97316', ytTitle: '參賽曲名_姓名_演奏組', hashtag: '#2026Ayers靈魂吉他手大賽' },
      { name: '彈唱組上傳規則', num: '2.', accent: '#3b82f6', ytTitle: '參賽曲名_姓名_彈唱組', hashtag: '#2026Ayers靈魂吉他手大賽' },
    ],
    openingTitle: '影片彈唱前需說明（必說）',
    opening: '「大家好我是（本名/藝名/團名），今天來參加2026Ayers靈魂吉他手大賽，報名（演奏組/彈唱組），我的靈魂是（xx）吉他魂（⚠️需與身上顏色相同，若不符將失去參賽資格，靈魂與顏色配對請參考下方卡片。），（想帶給大家的一句話）。比賽曲目是（創作者）的（歌名）。」',
  },
  demoVideos: {
    title: '示範影片',
    subtitle: '參考影片，了解如何參賽',
    landscape: { embedUrl: 'https://www.youtube.com/embed/t_AKjJfAzGU', title: '規則說明影片', desc: '了解完整參賽規則與注意事項' },
    portrait: { embedUrl: 'https://www.youtube.com/embed/P1IiYH3ePUU', title: '口白示範 ／ 人數示範', desc: '影片開頭口白說法與組別人數示範' },
  },
  playlist: {
    text: '看看其他參賽者的精彩演出',
    buttonText: '【點我看參賽者作品】',
    url: 'https://youtube.com/playlist?list=PLw6S60T2GSOx13l5eFQOME5Hd9TVzfRuw',
  },
  notes: {
    title: '注意事項',
    items: [
      '獲獎者須負擔國內外貨運費用（獎品由台灣、越南出貨）。',
      '參賽者須注意翻唱曲目之版權規章，如遇侵權問題與主辦單位無關。',
      '報名後同意影片授權公開於 AYERS 各網路平台推廣。',
      '主辦單位保有修改活動辦法及變更獎品之權力。',
      '影像呈現和聲音品質均列為評分標準。',
      '請確認影片有在 YouTube 播放清單中。',
      '每支影片對應一份表單。',
    ],
  },
  cta: {
    title: '想知道更多大賽資訊？',
    subtitle: '前往追蹤 Ayers 官方 IG／FB，第一手獲得大賽相關資訊',
    igUrl: 'https://www.instagram.com/ayersguitartw/',
    fbUrl: 'https://www.facebook.com/AyersgtUluruuke',
  },
};

/* ─── deep-merge：saved 覆蓋 default，物件遞迴合併、陣列整體取代 ─── */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge<T>(def: T, saved: unknown): T {
  if (!isPlainObject(def)) {
    // 純值或陣列：saved 有提供就整體取代，否則用預設
    return (saved !== undefined ? saved : def) as T;
  }
  if (!isPlainObject(saved)) return def;
  const out: Record<string, unknown> = { ...def };
  for (const key of Object.keys(def as Record<string, unknown>)) {
    if (key in saved) {
      const dv = (def as Record<string, unknown>)[key];
      out[key] = isPlainObject(dv) ? deepMerge(dv, saved[key]) : (saved[key] !== undefined ? saved[key] : dv);
    }
  }
  return out as T;
}

/** 將後台存的 metadata.content 合併到預設值上，永遠回傳完整內容物件。 */
export function mergeInfoContent(saved: unknown): InfoContent {
  return deepMerge(DEFAULT_INFO_CONTENT, saved);
}
