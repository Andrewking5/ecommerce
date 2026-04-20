import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import quizService, { type LayoutConfig, type AssetKey, DEFAULT_LAYOUT } from '../services/quizService';

/* ──────────────────────────────────────
   Soul Guitar — 結果頁
   路由：/e/soul-guitar/:slug
   ────────────────────────────────────── */

const BASE = '/images/events/quiz';
const CACHE_V = `?v=${__ASSET_V__}`; // auto-generated at build time — no manual bumping needed
const QUIZ_FONT = '"Glow Sans TC", "Noto Sans TC", sans-serif';

/* ── URL slug ↔ result key 映射（直譯） ── */
const SLUG_TO_KEY: Record<string, string> = {
  'fire': 'FIRE_自由',   // 火焰
  'fireworks': 'FIRE_故事',   // 煙火
  'sun': 'SUN_自由',    // 太陽
  'glow': 'SUN_故事',    // 微光
  'wave': 'WAVE_自由',   // 海浪
  'deep-sea': 'WAVE_故事',   // 深海
  'moon': 'MOON_故事',   // 月亮
  'dream-moon': 'MOON_自由',   // 夢月
};

/* ── 角色 → 素材資料夾 ── */
const RESULT_FOLDER: Record<string, string> = {
  FIRE_自由: 'fire',
  FIRE_故事: 'fireworks',
  SUN_自由: 'sun',
  SUN_故事: 'glow',
  WAVE_自由: 'wave',
  WAVE_故事: 'deep-sea',
  MOON_故事: 'moon',
  MOON_自由: 'dream-moon',
};

// logos（ayers、協辦、贊助）是共用素材，統一放在 sun 資料夾，所有結果型共用
const FOOTER_BASE = `${BASE}/result/sun`;
const enc = (name: string) => encodeURIComponent(name);


function OrganizerStripe({ stripeUrl }: { stripeUrl: string }) {
  const stripeH = 'clamp(44px, 12.09vw, 72px)';
  /* logo 高度直接 clamp，不依賴父層 padding 繼承 */
  const logoH = 'clamp(20px, 5.5vw, 36px)';
  const labelSize = 'clamp(9px, 1.6vw, 13px)';
  const innerGap = 'clamp(4px, 1.2vw, 10px)';  // 組內 logo 間距
  const sectionGap = 'clamp(10px, 3vw, 24px)';  // 主辦 | 協辦 | 贊助 之間

  const Label = ({ children }: { children: string }) => (
    <span className="text-white/70 whitespace-nowrap shrink-0 font-bold" style={{ fontSize: labelSize }}>{children}</span>
  );
  const Logo = ({ src, alt, scale = 1 }: { src: string; alt: string; scale?: number }) => (
    <img src={src} alt={alt} style={{ height: `calc(${logoH} * ${scale})` }} className="w-auto object-contain shrink-0" draggable={false} />
  );
  const Divider = () => (
    <div className="shrink-0 bg-white/20" style={{ width: 1, height: logoH }} />
  );

  return (
    <div className="relative z-10 w-full" style={{ height: stripeH, fontFamily: QUIZ_FONT }}>
      <img src={stripeUrl} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover object-center" />
      <div
        className="relative h-full flex items-center justify-center overflow-hidden"
        style={{ gap: sectionGap, paddingInline: 12 }}
      >
        <div className="flex items-center" style={{ gap: innerGap }}>
          <Label>主辦方</Label>
          <Logo src={`${FOOTER_BASE}/ayers.png`} alt="Ayers" />
        </div>
        <Divider />
        <div className="flex items-center" style={{ gap: innerGap }}>
          <Label>協辦</Label>
          <Logo src={`${FOOTER_BASE}/${enc('協辦 聲潮.png')}`} alt="聲潮" />
          <Logo src={`${FOOTER_BASE}/${enc('協辦91譜.png')}`} alt="91譜" scale={1.5} />
          <Logo src={`${FOOTER_BASE}/${enc('協辦 生為吉他人 死為吉他魂.png')}`} alt="生吉他魂" scale={0.8} />
        </div>
        <Divider />
        <div className="flex items-center" style={{ gap: innerGap }}>
          <Label>贊助</Label>
          <Logo src={`${FOOTER_BASE}/${enc('贊助 雲聲.png')}`} alt="雲聲" scale={0.85} />
          <Logo src={`${FOOTER_BASE}/${enc('贊助 奧昇.png')}`} alt="奧昇" />
        </div>
      </div>
    </div>
  );
}

/* ── 吉他連結（每個結果型各兩把，順序對應 guitar-1 / guitar-2） ── */
const GUITAR_LINKS: Record<string, [string, string]> = {
  SUN_自由: ['https://ayersguitars.com/products/4.html', 'https://ayersguitars.com/products/2.html'],
  SUN_故事: ['https://ayersguitars.com/products/10.html', 'https://ayersguitars.com/products/3.html'],
  WAVE_自由: ['https://ayersguitars.com/products/11.html', 'https://www.instagram.com/reel/DUsIVEIDuOS/?igsh=aW11cGN3OTR5Nmlo'],
  WAVE_故事: ['https://ayersguitars.com/products/12.html', 'https://ayersguitars.com/products/1.html'],
  MOON_自由: ['https://ayersguitars.com/products/58.html', 'https://ayersguitars.com/products/61.html'],
  MOON_故事: ['https://ayersguitars.com/products/20.html', 'https://ayersguitars.com/products/21.html'],
  FIRE_自由: ['https://ayersguitars.com/products/36.html', 'https://ayersguitars.com/products/32.html'],
  FIRE_故事: ['https://ayersguitars.com/products/33.html', 'https://ayersguitars.com/products/35.html'],
};

/* ── 結果資料 ── */
interface ResultInfo {
  name: string;
  soulTitle: string;
  tag: string;
  city: string;
  cityDesc: string;
  description: string;
  music: string;
  compatible: string;
  compatibleDesc: string;
  incompatible: string;
  incompatibleDesc: string;
  colorName: string;
  charImg: string;
  themeColor: string;
  themeBg: string;
  bgFile?: string;        // 背景圖（1920px 原圖，CSS 自動等比縮放至容器寬）
  stripeFile?: string;   // 布條背景圖（在各自資料夾內）
}

const RESULTS: Record<string, ResultInfo> = {
  FIRE_自由: {
    name: 'Fire Taichung',
    soulTitle: '火焰吉他靈魂',
    tag: '帶著能量的人',
    city: '台中 勤美草悟道／圓滿舞台',
    cityDesc: '像 Live House 的夜晚，有燈光、有節奏，也很有現場感。',
    description: '你是一個很有行動力的人，想到什麼就會立刻去做，不太喜歡猶豫或等待。你喜歡熱鬧的氣氛，也很容易帶動身邊的人一起投入。很多時候，你的能量就像火一樣，讓場面瞬間變得有溫度、有速度。',
    music: '#Rock Acoustic #Rhythm Guitar #Blues Guitar #Live Acoustic',
    compatible: 'Moon Hsinchu',
    compatibleDesc: '他給深度，你給行動力。',
    incompatible: 'Soft Sun Taoyuan',
    incompatibleDesc: '你想快一點，他想慢慢感受。',
    colorName: '紅色',
    charImg: `${BASE}/result/fire/char.webp${CACHE_V}`,
    themeColor: '#E04040',
    themeBg: 'linear-gradient(135deg, #FFE0D0 0%, #F08060 50%, #E04040 100%)',
    bgFile: 'bg.webp',
    stripeFile: '資產 28.png',
  },
  FIRE_故事: {
    name: 'Spark Kaohsiung',
    soulTitle: '煙火吉他靈魂',
    tag: '帶著火花的創作者',
    city: '高雄 駁二藝術特區',
    cityDesc: '像港口夜晚的光與風，開闊、有力量，也很有城市故事。',
    description: '你有很多想法，也很容易把感受變成表達。你不一定一直高調，但只要開始創作或說話，就很有力量。你喜歡有張力、有個性的東西。',
    music: '#Blues Guitar #Indie Rock Acoustic #Singer-Songwriter #情緒搖滾',
    compatible: 'Deep Wave Jiufen',
    compatibleDesc: '他的細節會讓你的表達更有層次。',
    incompatible: 'Sunny Taipei',
    incompatibleDesc: '你喜歡重量，他偏向輕鬆明亮。',
    colorName: '紅色',
    charImg: `${BASE}/result/fireworks/char.webp${CACHE_V}`,
    themeColor: '#D05030',
    themeBg: 'linear-gradient(135deg, #FFE8D8 0%, #E88060 50%, #D05030 100%)',
    bgFile: 'bg.webp',
    stripeFile: '資產 28.png',
  },
  SUN_自由: {
    name: 'Sunny Taipei',
    soulTitle: '太陽吉他靈魂',
    tag: '陽光型生活家',
    city: '台北 華山文創園區',
    cityDesc: '城市的街頭、咖啡廳、午後的陽光與人群。你的音樂像城市裡亮起的霓虹燈，在忙碌的生活中帶來一點光。',
    description: '你給人的感覺自然、輕鬆，很容易讓人放下防備。你喜歡生活裡那些簡單卻舒服的瞬間，也很擅長把氣氛變得明亮。很多人和你相處時，會不自覺地放鬆下來。',
    music: '#清新民謠 #Acoustic Pop #Indie Folk #Campfire Acoustic',
    compatible: 'Wave Hualien',
    compatibleDesc: '他的自由感會讓你的世界更開闊。',
    incompatible: 'Deep Wave Jiufen',
    incompatibleDesc: '你喜歡輕盈往前，他比較容易停留在情緒裡。',
    colorName: '橘黃色',
    charImg: `${BASE}/result/sun/char.webp${CACHE_V}`,
    themeColor: '#FF9A3E',
    themeBg: 'linear-gradient(135deg, #FFF4CC 0%, #FFE4A0 50%, #FF9A3E 100%)',
    bgFile: 'bg.webp',
    stripeFile: '資產 28.png',
  },
  SUN_故事: {
    name: 'Soft Sun Taoyuan',
    soulTitle: '微光吉他靈魂',
    tag: '溫暖的傾聽者',
    city: '桃園 大溪老街',
    cityDesc: '像城市與遠方之間的地方，安靜、溫和，也藏著很多故事。',
    description: '你細膩、溫柔，也很懂得理解別人的感受。你不一定話最多，但你很會聽，也很會接住情緒。很多人會在你身邊感到安心。',
    music: '#抒情民謠 #Acoustic Ballad #Folk Guitar #情感型彈唱',
    compatible: 'Dream Moon Tainan',
    compatibleDesc: '你的溫暖與他的情緒很容易產生共鳴。',
    incompatible: 'Fire Taichung',
    incompatibleDesc: '你喜歡慢慢醞釀，他習慣快速推進。',
    colorName: '橘黃色',
    charImg: `${BASE}/result/glow/char.webp${CACHE_V}`,
    themeColor: '#F0B860',
    themeBg: 'linear-gradient(135deg, #FFF8E8 0%, #FFE8B0 50%, #F0B860 100%)',
    bgFile: 'bg.webp',
    stripeFile: '資產 28.png',
  },
  WAVE_自由: {
    name: 'Wave Hualien',
    soulTitle: '海浪吉他靈魂',
    tag: '自由的探索者',
    city: '花蓮 七星潭海岸',
    cityDesc: '海風、山與海的交界、自由延伸的海岸線。你就像山海之間的風，開闊、自由，也沒有太多限制。',
    description: '你喜歡空間、變化和自由感，不太喜歡被固定模式困住。你很依靠感覺，也很容易被新的地方與新的體驗吸引。你的生活節奏通常比較流動，也讓身邊的人感到輕鬆自在。',
    music: '#Fingerstyle Guitar #Indie Acoustic #Instrumental Guitar #Travel Folk',
    compatible: 'Sunny Taipei',
    compatibleDesc: '他的輕鬆會讓你的自由更自在。',
    incompatible: 'Moon Hsinchu',
    incompatibleDesc: '你喜歡流動，他比較習慣停下來思考。',
    colorName: '藍色',
    charImg: `${BASE}/result/wave/char.webp${CACHE_V}`,
    themeColor: '#4A9EC5',
    themeBg: 'linear-gradient(135deg, #E0F2FE 0%, #7EC8E3 50%, #4A9EC5 100%)',
    bgFile: 'bg.webp',
    stripeFile: '資產 28.png',
  },
  WAVE_故事: {
    name: 'Deep Wave Jiufen',
    soulTitle: '深海吉他靈魂',
    tag: '海霧裡的觀察者',
    city: '九份 阿妹茶樓',
    cityDesc: '像山城的霧與燈火，安靜、有故事，也帶著一點神秘感。',
    description: '你是一個很有內在世界的人。你很會觀察，也很容易注意到細節與情緒。你不急著表達，但其實想得很多。你喜歡有層次、有深度的東西。',
    music: '#Indie Folk #Ambient Acoustic #情緒指彈 #Acoustic Instrumental',
    compatible: 'Dream Moon Tainan',
    compatibleDesc: '你們都很容易感受到音樂裡的情緒。',
    incompatible: 'Sunny Taipei',
    incompatibleDesc: '你喜歡慢慢感受，他比較習慣輕快往前。',
    colorName: '藍色',
    charImg: `${BASE}/result/deep-sea/char.webp${CACHE_V}`,
    themeColor: '#2E6B8A',
    themeBg: 'linear-gradient(135deg, #C8E0EC 0%, #5A9AB5 50%, #2E6B8A 100%)',
    bgFile: 'bg.webp',
    stripeFile: '資產 28.png',
  },
  MOON_故事: {
    name: 'Moon Hsinchu',
    soulTitle: '月光吉他靈魂',
    tag: '安靜的思考者',
    city: '新竹 新竹公園',
    cityDesc: '像夜晚的風，安靜、清楚，也有自己的節奏。',
    description: '你是一個很習慣向內思考的人。你習慣先觀察、先思考，再慢慢表達自己。你需要一些自己的空間，也很擅長整理內心的想法。你不是冷淡，只是比較安靜。',
    music: '#Fingerstyle Guitar #Ambient Acoustic #Indie Acoustic #Melodic Guitar',
    compatible: 'Fire Taichung',
    compatibleDesc: '他的行動力會幫你把想法更勇敢地說出來。',
    incompatible: 'Wave Hualien',
    incompatibleDesc: '你需要沉澱，他習慣一直往前探索。',
    colorName: '黑色 / 白色',
    charImg: `${BASE}/result/moon/char.webp${CACHE_V}`,
    themeColor: '#6B6B9E',
    themeBg: 'linear-gradient(135deg, #E8E8F0 0%, #A0A0C8 50%, #6B6B9E 100%)',
    bgFile: 'bg.webp',
    stripeFile: '資產 28.png',
  },
  MOON_自由: {
    name: 'Dream Moon Tainan',
    soulTitle: '夢月吉他靈魂',
    tag: '月光裡的說故事的人',
    city: '台南 神農街',
    cityDesc: '老街的燈光、慢慢的步調與溫暖的人情味。老街的夜晚，慢慢流動，也帶著很多故事。',
    description: '你感受力很強，也很容易被一段旋律或一個畫面打動。你不是最外放的人，但你的內在世界很豐富。很多情緒在你心裡都會停留很久。很多時候，你的想法都帶著一點浪漫與自由。',
    music: '#Acoustic Folk #抒情民謠 #Indie Acoustic #情緒指彈',
    compatible: 'Soft Sun Taoyuan',
    compatibleDesc: '他的溫暖能接住你的情緒。',
    incompatible: 'Wave Hualien',
    incompatibleDesc: '你喜歡沉浸，他比較喜歡往外探索。',
    colorName: '黑色 / 白色',
    charImg: `${BASE}/result/dream-moon/char.webp${CACHE_V}`,
    themeColor: '#7B6BA0',
    themeBg: 'linear-gradient(135deg, #EDE8F5 0%, #B0A0D0 50%, #7B6BA0 100%)',
    bgFile: 'bg.webp',
    stripeFile: '資產 28.png',
  },
};

/* ── SUN 型專屬：dot grid + 吉他弦 + 音孔 ── */
const GUITAR_STRINGS = [
  { y: 13, amp: 0.5, dur: 0.72, delay: 0, sw: 0.5, op: 0.07 },
  { y: 25, amp: 0.6, dur: 0.88, delay: 0.18, sw: 0.6, op: 0.08 },
  { y: 38, amp: 0.7, dur: 0.95, delay: 0.08, sw: 0.7, op: 0.09 },
  { y: 52, amp: 0.6, dur: 0.82, delay: 0.28, sw: 0.8, op: 0.10 },
  { y: 65, amp: 0.5, dur: 0.91, delay: 0.14, sw: 0.9, op: 0.11 },
  { y: 78, amp: 0.4, dur: 0.78, delay: 0.22, sw: 1.0, op: 0.12 },
];

const ROSETTE_RADII = [14, 24, 38, 52, 66, 80, 94];

function SunGrainOverlay() {
  return (
    <>
      <style>{`
        @keyframes sunDotDrift { from { background-position: 0 0; } to { background-position: 6px 6px; } }
        @keyframes sunDotDriftReverse { from { background-position: 0 0; } to { background-position: -10px 10px; } }
      `}</style>

      {/* 細點陣 */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, backgroundImage: `repeating-radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1.5px)`, backgroundSize: '6px 6px', mixBlendMode: 'multiply', animation: 'sunDotDrift 5s linear infinite' }} />
      {/* 粗點陣反向 */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, backgroundImage: `repeating-radial-gradient(circle, rgba(0,0,0,0.05) 1.5px, transparent 2px)`, backgroundSize: '11px 11px', mixBlendMode: 'multiply', animation: 'sunDotDriftReverse 9s linear infinite' }} />

      {/* 頂部金光脈動 */}
      <motion.div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, background: 'radial-gradient(ellipse at 50% 20%, rgba(255,210,80,0.28) 0%, transparent 60%)', mixBlendMode: 'overlay' }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

      {/* 浮動光暈 orbs */}
      <motion.div className="fixed pointer-events-none rounded-full" style={{ width: 300, height: 300, left: '-8%', top: '2%', background: 'rgba(231,188,0,0.22)', filter: 'blur(72px)', zIndex: 1, mixBlendMode: 'screen' }} animate={{ x: [0, 50, 15, 0], y: [0, 40, -25, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="fixed pointer-events-none rounded-full" style={{ width: 220, height: 220, right: '-6%', bottom: '18%', background: 'rgba(236,111,0,0.28)', filter: 'blur(60px)', zIndex: 1, mixBlendMode: 'screen' }} animate={{ x: [0, -35, 10, 0], y: [0, -45, 20, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="fixed pointer-events-none rounded-full" style={{ width: 160, height: 160, left: '25%', top: '45%', background: 'rgba(255,215,80,0.18)', filter: 'blur(50px)', zIndex: 1, mixBlendMode: 'screen' }} animate={{ x: [0, 25, -20, 0], y: [0, -30, 35, 0] }} transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }} />

      {/* 吉他弦 — 6 條微幅振動 */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }} viewBox="0 0 100 100" preserveAspectRatio="none">
        {GUITAR_STRINGS.map((s, i) => (
          <motion.path
            key={i}
            fill="none"
            stroke="rgba(255,240,160,1)"
            strokeOpacity={s.op}
            strokeWidth={s.sw}
            vectorEffect="non-scaling-stroke"
            animate={{
              d: [
                `M 0 ${s.y} Q 50 ${s.y - s.amp} 100 ${s.y}`,
                `M 0 ${s.y} Q 50 ${s.y + s.amp} 100 ${s.y}`,
                `M 0 ${s.y} Q 50 ${s.y - s.amp} 100 ${s.y}`,
              ]
            }}
            transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
          />
        ))}
      </svg>

      {/* 音孔花紋 Rosette — 緩慢旋轉 */}
      <div className="fixed pointer-events-none" style={{ top: '6%', left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
        <motion.svg viewBox="0 0 200 200" width="220" style={{ opacity: 0.09 }} animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: 'linear' }} xmlns="http://www.w3.org/2000/svg">
          {ROSETTE_RADII.map(r => (
            <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="white" strokeWidth={r < 30 ? 1 : 0.6} />
          ))}
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <line key={i} x1={100 + Math.cos(a) * 26} y1={100 + Math.sin(a) * 26} x2={100 + Math.cos(a) * 51} y2={100 + Math.sin(a) * 51} stroke="white" strokeWidth="0.5" />;
          })}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={`d${i}`} cx={100 + Math.cos(a) * 61} cy={100 + Math.sin(a) * 61} r="1.8" fill="white" fillOpacity="0.6" />;
          })}
        </motion.svg>
      </div>
    </>
  );
}

/* ── 完整圖片結果頁（所有有素材的角色共用） ── */
function FullResultPage({ resultKey, folder, layout }: {
  resultKey: string;
  folder: string;
  layout: LayoutConfig;
}) {
  const RF = `${BASE}/result/${folder}`;
  const result = RESULTS[resultKey];
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailVal, setEmailVal] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailDone, setEmailDone] = useState(false);
  const [emailError, setEmailError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

  // 取得某個素材的 flow 樣式（寬度 + 上邊距 + 圖層）
  // marginTop 用容器寬度的 % 而非 px，讓間距在所有手機上等比例縮放
  // x/y 使用 CSS `translate` 屬性，避免與 Framer Motion 的 transform 衝突
  const fs = (key: AssetKey, extra?: React.CSSProperties): React.CSSProperties => {
    const c = layout[key];
    return {
      width: `${c.w}%`,
      marginTop: `${(c.mt / 430 * 100).toFixed(2)}%`,
      zIndex: c.z,
      position: 'relative',
      ...(c.x !== 0 || c.y !== 0 ? { translate: `${c.x}px ${c.y}px` } : {}),
      ...extra,
    };
  };

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  // 結果頁背景音樂
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;
    audio.loop = true;
    audio.play()
      .then(() => setAudioPlaying(true))
      .catch(() => setAudioPlaying(false)); // 瀏覽器封鎖自動播放 → 靜音狀態
    return () => { audio.pause(); audio.currentTime = 0; };
  }, [folder]);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
    } else {
      audio.play().then(() => setAudioPlaying(true)).catch(() => { });
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/e/soul-guitar/${folder}`;
    const shareText = `我的吉他靈魂是「${result.soulTitle}」！快來測測你的 🎸測驗完成再來報名「靈魂吉他手大賽」，總獎金高達20萬元！`;

    // 1. 嘗試帶圖分享（iOS Safari 15+ / Android Chrome 支援）
    if (navigator.share) {
      try {
        const imgSrc = `${RF}/hero-card.webp${CACHE_V}`;
        const blob = await fetch(imgSrc).then(r => r.blob());
        const file = new File([blob], 'my-guitar-soul.webp', { type: blob.type });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: shareText, text: shareText, url: shareUrl, files: [file] });
        } else {
          await navigator.share({ title: shareText, text: shareText, url: shareUrl });
        }
        // resolve = 使用者選了分享目標
        if (!localStorage.getItem('soulGuitar_shareEmail')) setShowEmailModal(true);
        return;
      } catch {
        return;
      }
    }

    // 2. 桌機 fallback：複製連結
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    if (!localStorage.getItem('soulGuitar_shareEmail')) setShowEmailModal(true);
  };

  const handleEmailSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setEmailError('請輸入有效的 Email');
      return;
    }
    setEmailLoading(true);
    setEmailError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      await fetch(`${apiUrl}/quiz/share-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, slug: folder, resultKey }),
      });
      localStorage.setItem('soulGuitar_shareEmail', '1');
      setEmailDone(true);
    } catch {
      setEmailError('送出失敗，請稍後再試');
    } finally {
      setEmailLoading(false);
    }
  };

  const guitarLinks = GUITAR_LINKS[resultKey] ?? ['', ''];
  const C = layout; // 短名

  return (
    <>
      {/* 結果頁背景音樂 */}
      <audio ref={audioRef} src={`/audio/quiz/result/${folder}.mp3`} preload="none" />

      {/* 音樂開關按鈕（固定在右上角） */}
      <motion.button
        type="button"
        onClick={toggleAudio}
        className="fixed top-4 right-4 z-110 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        aria-label={audioPlaying ? '關閉音樂' : '開啟音樂'}
      >
        {audioPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-50">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        )}
      </motion.button>

      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative z-10 flex flex-col items-center w-full pb-[14.88%]">

          {/* ─── Hero Card（長按可儲存）─── */}
          <motion.div
            className="mx-auto relative"
            style={fs('heroCard')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img src={`${RF}/hero-card.webp${CACHE_V}`} alt={result.name} className="w-full h-auto block" />
          </motion.div>

          <div className="w-full flex flex-col items-center">

            {/* 長按儲存提示 */}
            <motion.div
              style={fs('textSave')}
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 0.7 : 0, y: showContent ? [0, -3, 0] : 0 }}
              transition={{ opacity: { duration: 0.5 }, y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <img src={`${RF}/text-save.webp${CACHE_V}`} alt="長按上方結果圖儲存圖片" className="w-full h-auto" draggable={false} />
            </motion.div>

            {/* 往下看提示 */}
            <motion.div
              style={fs('textScroll')}
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? [0, 6, 0] : 10 }}
              transition={{ opacity: { duration: 0.5, delay: 0.2 }, y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <img src={`${RF}/text-scroll.webp${CACHE_V}`} alt="往下看你的靈魂檔案" className="w-full h-auto" draggable={false} />
            </motion.div>

            {/* 一個讓你被聽見的機會 */}
            <motion.div
              style={fs('textChance')}
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ opacity: { duration: 0.5, delay: 0.4 } }}
            >
              <img src={`${RF}/text-chance.webp${CACHE_V}`} alt="一個讓你被聽見的機會" className="w-full h-auto" draggable={false} />
            </motion.div>

            {/* 角色圖 + 兩側裝飾 */}
            <motion.div
              className="w-full relative flex justify-center overflow-visible"
              style={{ marginTop: `${(C.char.mt / 430 * 100).toFixed(2)}%` }}
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: showContent ? 1 : 0.8, y: showContent ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* showContent 後才掛載，避免 opacity:0 讓瀏覽器暫停 animated WebP */}
              {showContent && (
                <img
                  src={result.charImg}
                  alt={result.name}
                  style={{ width: `${C.char.w}%`, transform: `translate(${C.char.x}px, ${C.char.y}px)`, zIndex: C.char.z }}
                  className="relative h-auto object-contain"
                  draggable={false}
                />
              )}
              <img
                src={`${RF}/char-right.webp${CACHE_V}`}
                alt={result.colorName}
                style={{ width: `${C.charRight.w}%`, top: `${C.charRight.mt}%`, right: `${C.charRight.x}%`, zIndex: C.charRight.z }}
                className="absolute h-auto object-contain"
                draggable={false}
              />
            </motion.div>

            {/* 你的個人特質 */}
            <motion.div
              style={fs('personalityCard')}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={`${RF}/personality-card.webp${CACHE_V}`} alt="你的個人特質" className="w-full h-auto rounded-xl" draggable={false} />
            </motion.div>

            {/* 城市卡 */}
            <motion.div
              className="overflow-hidden rounded-xl"
              style={fs('cityCard')}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={`${RF}/city-card.webp${CACHE_V}`} alt={result.city} className="w-full h-auto" draggable={false} />
            </motion.div>

            {/* 猜猜這是哪 */}
            <motion.div
              style={fs('textGuess')}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img src={`${RF}/text-guess.webp${CACHE_V}`} alt="猜猜這是哪" className="w-full h-auto" draggable={false} />
            </motion.div>

            {/* 這樣的你，會發出什麼樣的聲音？ */}
            <motion.div
              style={fs('textSound')}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img src={`${RF}/text-sound.webp${CACHE_V}`} alt="這樣的你，會發出什麼樣的聲音" className="w-full h-auto" draggable={false} />
            </motion.div>

            {/* 你可能會喜歡的 Ayers 吉他款式 */}
            <motion.div
              style={fs('titleAyers')}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img src={`${RF}/title-ayers.webp${CACHE_V}`} alt="你可能會喜歡的Ayers吉他款式" className="w-full h-auto" draggable={false} />
            </motion.div>

            {/* 兩把吉他 */}
            <div className="mt-[4.65%] w-full grid grid-cols-2 gap-[3.72%] items-stretch">
              {([1, 2] as const).map(i => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center justify-between gap-3"
                  initial={{ opacity: 0, x: i === 1 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div style={fs(`guitar${i}` as AssetKey)}>
                    <img src={`${RF}/guitar-${i}.webp${CACHE_V}`} alt="Ayers 吉他" className="w-full h-auto object-contain" draggable={false} />
                  </div>
                  <motion.a
                    href={guitarLinks[i - 1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={fs(`btnUnlock${i}` as AssetKey)}
                    whileTap={{ scale: 0.93 }}
                  >
                    <img src={`${RF}/btn-unlock-${i}.webp${CACHE_V}`} alt="解鎖它的音色" className="w-full h-auto" draggable={false} />
                  </motion.a>
                </motion.div>
              ))}
            </div>

            {/* 你聽出來了嗎 */}
            <motion.div
              style={fs('textHeard')}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
            >
              <img src={`${RF}/text-heard.webp${CACHE_V}`} alt="你聽出來了嗎" className="w-full h-auto" draggable={false} />
            </motion.div>

            {/* 你會愛上的吉他音樂風格 */}
            <motion.div
              style={fs('titleMusic')}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img src={`${RF}/title-music-style.webp${CACHE_V}`} alt="你會愛上的吉他音樂風格" className="w-full h-auto" draggable={false} />
            </motion.div>

            {/* 音樂風格標籤 */}
            <div className="flex flex-col gap-[3px]">
              {([1, 2, 3, 4] as const).map(i => (
                <motion.div
                  key={i}
                  style={fs(`tag${i}` as AssetKey)}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <img src={`${RF}/tag-${i}.webp${CACHE_V}`} alt="" className="w-full h-auto" draggable={false} />
                </motion.div>
              ))}
            </div>

            {/* 比賽資訊文字 */}
            <motion.div
              style={fs('textContest')}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <img src={`${RF}/text-contest-info.webp${CACHE_V}`} alt="比賽資訊" className="w-full h-auto" draggable={false} />
            </motion.div>

            {/* 比賽海報 */}
            <motion.div
              className="overflow-hidden rounded-xl"
              style={fs('poster')}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src={`${RF}/poster.webp${CACHE_V}`} alt="靈魂吉他手大賽海報" className="w-full h-auto rounded-xl" draggable={false} />
            </motion.div>

            {/* 底部按鈕 */}
            <motion.div
              className="mt-[9.30%] w-full flex flex-col items-center gap-[3.72%]"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.img
                src={`${RF}/char-type.webp${CACHE_V}`}
                alt="分享抽獎說明"
                style={fs('charType', { display: 'block' })}
                className="h-auto self-start"
                draggable={false}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="w-full flex items-center gap-[2.79%]">
                <motion.button
                  type="button"
                  onClick={handleShare}
                  style={fs('btnShare')}
                  className="relative shrink-0"
                  whileTap={{ scale: 0.93 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* 外層光暈 — 較大範圍閃爍 */}
                  <motion.div
                    className="absolute -inset-3 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(218,165,50,0.45) 0%, transparent 65%)' }}
                    animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <img src={`${RF}/btn-share.webp${CACHE_V}`} alt="分享你的測驗結果" className="relative w-full h-auto" draggable={false} />
                  {copied && (
                    <motion.span
                      className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ fontFamily: QUIZ_FONT }}
                    >
                      已複製到剪貼簿
                    </motion.span>
                  )}
                </motion.button>
                <motion.button type="button" onClick={() => navigate('/e/soul-guitar')} style={fs('btnRetry')} className="shrink-0" whileTap={{ scale: 0.93 }}>
                  <img src={`${RF}/btn-retry.webp${CACHE_V}`} alt="再測一次" className="w-full h-auto" draggable={false} />
                </motion.button>
              </div>

              <Link to="/e/soul-guitar/info" style={fs('btnContest')} className="active:scale-95 transition-transform">
                <img src={`${RF}/btn-contest.webp${CACHE_V}`} alt="前往了解靈魂吉他手大賽" className="w-full h-auto" draggable={false} />
              </Link>
            </motion.div>

            <div className="h-0 pb-[7.44%]" />

          </div>
        </div>

      </motion.div>

      {/* ── 分享後抽獎 Email bottom sheet ── */}
      <AnimatePresence>
        {showEmailModal && (
          <>
            {/* backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !emailLoading && setShowEmailModal(false)}
            />
            {/* sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white px-6 pt-6 pb-10"
              style={{ fontFamily: QUIZ_FONT, maxWidth: 430, margin: '0 auto' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* 拖曳把手 */}
              <div className="mx-auto mb-4 w-10 h-1 rounded-full bg-gray-200" />

              {emailDone ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="text-4xl">🎸</div>
                  <p className="text-lg font-bold text-gray-800">報名成功！</p>
                  <p className="text-sm text-gray-500 text-center">抽獎結果將寄送至您的 Email<br />祝您好運！</p>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="mt-4 w-full py-3 rounded-2xl text-white font-bold text-base"
                    style={{ background: result.themeColor }}
                  >
                    關閉
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-800 mb-1">分享完成 🎉</p>
                  <p className="text-sm text-gray-500 mb-5">填寫 Email 參加角色小卡組抽獎</p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={emailVal}
                    onChange={e => { setEmailVal(e.target.value); setEmailError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-400 mb-2"
                  />
                  {emailError && <p className="text-xs text-red-500 mb-2">{emailError}</p>}
                  <button
                    type="button"
                    onClick={handleEmailSubmit}
                    disabled={emailLoading}
                    className="w-full py-3 rounded-2xl text-white font-bold text-base disabled:opacity-60 transition-opacity"
                    style={{ background: result.themeColor }}
                  >
                    {emailLoading ? '送出中…' : '參加抽獎'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="mt-3 w-full py-2 text-sm text-gray-400"
                  >
                    下次再說
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── 版面編輯器（管理員用，?edit 啟用） ── */

/** 每個素材的 meta：中文標籤 + slider 範圍 + 是否為絕對定位 */
const ASSET_META: {
  key: AssetKey;
  label: string;
  abs?: boolean; // charRight 用絕對定位，mt=top%, x=side%
  wMin?: number; wMax?: number;
  mtMin?: number; mtMax?: number;
  xMin?: number; xMax?: number;
  yMin?: number; yMax?: number;
  zMin?: number; zMax?: number;
}[] = [
    // 所有範圍刻意放大，讓設計師可以自由移動 / 縮放
    { key: 'heroCard', label: 'Hero 結果卡', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'textSave', label: '長按儲存提示', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'textScroll', label: '往下看提示', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'textChance', label: '機會文字', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'char', label: '角色圖', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'charRight', label: '右側裝飾', abs: true, wMin: 0, wMax: 150, mtMin: -50, mtMax: 200, xMin: -50, xMax: 100, zMin: 0, zMax: 50 },
    { key: 'personalityCard', label: '個人特質卡', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'cityCard', label: '城市卡', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'textGuess', label: '猜猜這是哪', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'textSound', label: '發出什麼聲音', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'titleAyers', label: 'Ayers 吉他標題', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'guitar1', label: '吉他圖 1', wMin: 0, wMax: 150, mtMin: -100, mtMax: 200, xMin: -100, xMax: 100, yMin: -100, yMax: 100 },
    { key: 'guitar2', label: '吉他圖 2', wMin: 0, wMax: 150, mtMin: -100, mtMax: 200, xMin: -100, xMax: 100, yMin: -100, yMax: 100 },
    { key: 'btnUnlock1', label: '解鎖按鈕 1', wMin: 0, wMax: 150, mtMin: -50, mtMax: 100, xMin: -100, xMax: 100, yMin: -100, yMax: 100 },
    { key: 'btnUnlock2', label: '解鎖按鈕 2', wMin: 0, wMax: 150, mtMin: -50, mtMax: 100, xMin: -100, xMax: 100, yMin: -100, yMax: 100 },
    { key: 'textHeard', label: '你聽出來了嗎', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'titleMusic', label: '音樂風格標題', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'tag1', label: '標籤 1', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -100, yMax: 100 },
    { key: 'tag2', label: '標籤 2', wMin: 0, wMax: 200, mtMin: -50, mtMax: 100, xMin: -300, xMax: 300, yMin: -100, yMax: 100 },
    { key: 'tag3', label: '標籤 3', wMin: 0, wMax: 200, mtMin: -50, mtMax: 100, xMin: -300, xMax: 300, yMin: -100, yMax: 100 },
    { key: 'tag4', label: '標籤 4', wMin: 0, wMax: 200, mtMin: -50, mtMax: 100, xMin: -300, xMax: 300, yMin: -100, yMax: 100 },
    { key: 'textContest', label: '比賽資訊文字', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'poster', label: '比賽海報', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'charType', label: '角色型標籤', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
    { key: 'btnShare', label: '分享按鈕', wMin: 0, wMax: 100, mtMin: -50, mtMax: 100, xMin: -100, xMax: 100, yMin: -100, yMax: 100 },
    { key: 'btnRetry', label: '再測一次', wMin: 0, wMax: 100, mtMin: -50, mtMax: 100, xMin: -100, xMax: 100, yMin: -100, yMax: 100 },
    { key: 'btnContest', label: '前往比賽', wMin: 0, wMax: 200, mtMin: -100, mtMax: 200, xMin: -200, xMax: 200, yMin: -100, yMax: 100 },
  ];

function LayoutEditor({ slug, layout, onChange, onReset, editKey }: {
  slug: string;
  layout: LayoutConfig;
  onChange: (patch: Partial<LayoutConfig>) => void;
  onReset: () => void;
  editKey: string;
}) {
  const [panelOpen, setPanelOpen] = useState(true);
  const [expanded, setExpanded] = useState<AssetKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // 更新某素材的單一屬性
  const update = (key: AssetKey, field: keyof typeof layout[AssetKey], value: number) => {
    onChange({ [key]: { ...layout[key], [field]: value } } as Partial<LayoutConfig>);
  };

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(layout, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      onChange(parsed as Partial<LayoutConfig>);
      setImportText('');
      setShowImport(false);
      setImportError(false);
    } catch {
      setImportError(true);
      setTimeout(() => setImportError(false), 2500);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      await quizService.saveLayout(slug, layout, editKey || undefined);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // 單一 slider 行
  const Slider = ({ label, value, min, max, onChange: onCh }: {
    label: string; value: number; min: number; max: number; onChange: (v: number) => void;
  }) => (
    <div className="flex items-center gap-1.5 text-[10px]">
      <span className="w-14 shrink-0 text-white/50">{label}</span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={e => onCh(Number(e.target.value))}
        className="flex-1 accent-amber-400 h-[3px]"
      />
      <input
        type="number"
        aria-label={`${label} 數值`}
        value={value}
        min={min}
        max={max}
        onChange={e => {
          const v = Number(e.target.value);
          if (!isNaN(v)) onCh(Math.min(max, Math.max(min, v)));
        }}
        className="w-11 text-right bg-white/10 text-white/90 tabular-nums font-mono rounded px-1 border-0 outline-none focus:bg-white/20 text-[10px]"
        style={{ MozAppearance: 'textfield' }}
      />
    </div>
  );

  return (
    <div className="fixed right-0 top-0 h-full z-200 flex pointer-events-none">
      {/* 收合按鈕 */}
      <button
        type="button"
        className="self-center pointer-events-auto bg-black/80 hover:bg-black text-white px-1 py-3 rounded-l-lg text-[10px] leading-none flex flex-col items-center gap-1 shadow-lg [writing-mode:vertical-rl]"
        onClick={() => setPanelOpen(p => !p)}
      >
        <span>{panelOpen ? '▶' : '◀'}</span>
        <span className="rotate-180">版面</span>
      </button>

      {panelOpen && (
        <div className="pointer-events-auto w-72 bg-black/92 backdrop-blur-sm text-white overflow-y-auto flex flex-col shadow-2xl">

          {/* 頂部固定 header */}
          <div className="sticky top-0 z-10 bg-black/95 px-3 py-2 flex items-center justify-between border-b border-white/10">
            <span className="font-bold text-xs">版面編輯器</span>
            <button type="button" onClick={onReset} className="text-red-400 hover:text-red-300 text-[10px]">重置</button>
          </div>

          {/* 素材列表 */}
          <div className="flex flex-col">
            {ASSET_META.map(({ key, label, abs, wMin = 10, wMax = 120, mtMin = 0, mtMax = 100, xMin = -20, xMax = 50, yMin = -60, yMax = 60, zMin = 0, zMax = 50 }) => {
              const isOpen = expanded === key;
              const c = layout[key];
              return (
                <div key={key} className="border-b border-white/5">
                  {/* 素材列標題 */}
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : key)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 text-left"
                  >
                    <span className={`text-[11px] ${isOpen ? 'text-amber-400' : 'text-white/80'}`}>{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-[9px] font-mono">W{c.w} Z{c.z}</span>
                      <span className="text-white/40 text-[10px]">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {/* 展開的 sliders */}
                  {isOpen && (
                    <div className="px-3 pb-3 flex flex-col gap-2 bg-white/3">
                      <Slider label="寬 W %" value={c.w} min={wMin} max={wMax} onChange={v => update(key, 'w', v)} />
                      {abs ? (
                        <>
                          <Slider label="上 top%" value={c.mt} min={mtMin} max={mtMax} onChange={v => update(key, 'mt', v)} />
                          <Slider label="右 right%" value={c.x} min={xMin} max={xMax} onChange={v => update(key, 'x', v)} />
                        </>
                      ) : (
                        <>
                          <Slider label="上距 mt px" value={c.mt} min={mtMin} max={mtMax} onChange={v => update(key, 'mt', v)} />
                          <Slider label="← → x px" value={c.x} min={-150} max={150} onChange={v => update(key, 'x', v)} />
                          <Slider label="↑ ↓ y px" value={c.y} min={yMin} max={yMax} onChange={v => update(key, 'y', v)} />
                        </>
                      )}
                      <Slider label="圖層 Z" value={c.z} min={zMin} max={zMax} onChange={v => update(key, 'z', v)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 底部固定區 */}
          <div className="sticky bottom-0 bg-black/95 px-3 py-2 border-t border-white/10 flex flex-col gap-2">
            {/* 匯出 / 匯入 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white/80 py-1.5 rounded text-[10px] transition-colors"
              >
                {copied ? '已複製 ✓' : '匯出 JSON'}
              </button>
              <button
                type="button"
                onClick={() => setShowImport(p => !p)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white/80 py-1.5 rounded text-[10px] transition-colors"
              >
                匯入 JSON
              </button>
            </div>
            {showImport && (
              <div className="flex flex-col gap-1.5">
                <textarea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder='貼上 JSON…'
                  className="w-full h-24 bg-white/10 text-white/80 text-[9px] font-mono p-1.5 rounded border-0 outline-none resize-none focus:bg-white/15 placeholder-white/30"
                />
                <button
                  type="button"
                  onClick={handleImport}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white py-1.5 rounded text-[10px] transition-colors"
                >
                  {importError ? '❌ JSON 格式錯誤' : '套用'}
                </button>
              </div>
            )}
            {/* 儲存 */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-2 rounded text-xs transition-colors"
            >
              {saving ? '儲存中…' : saved ? '已儲存 ✓' : saveError ? '❌ 儲存失敗' : '儲存到資料庫'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 統一載入畫面（與測驗頁同款） ── */
function ResultLoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#f5f0e8]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img src={`${BASE}/loading.webp${CACHE_V}`} alt="載入中" className="w-40 h-40 object-contain" draggable={false} />
      <motion.p
        className="mt-6 text-[#2a2a2a]/60 text-sm tracking-widest"
        style={{ fontFamily: QUIZ_FONT }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        正在為你準備結果⋯
      </motion.p>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   頁面進入點 — 讀 URL slug → 渲染結果
   ────────────────────────────────────── */
export default function SoulGuitarResult() {
  const { pathname, search } = useLocation();
  const slug = pathname.replace('/e/soul-guitar/', '').replace(/\/$/, '');
  const resultKey = SLUG_TO_KEY[slug];
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT);
  const searchParams = new URLSearchParams(search);
  const [isEditMode] = useState(() => searchParams.has('edit'));
  const isNewDesign = searchParams.has('1');
  const editKey = searchParams.get('edit') || '';
  const folder = resultKey ? RESULT_FOLDER[resultKey] : null;

  useEffect(() => {
    sessionStorage.removeItem('soulGuitar_fromQuiz');
  }, []);

  useEffect(() => {
    if (!folder || !resultKey) return;

    // Track this result (fire-and-forget, won't break UX on failure)
    quizService.trackResult(slug, resultKey);

    // All result types share the same layout; always load from 'sun'
    quizService.getLayout('sun').then(cfg => {
      if (cfg) {
        const merged = { ...DEFAULT_LAYOUT };
        for (const key of Object.keys(DEFAULT_LAYOUT) as AssetKey[]) {
          if (cfg[key] != null && typeof cfg[key] === 'object') {
            merged[key] = { ...DEFAULT_LAYOUT[key], ...cfg[key] };
          }
        }
        setLayout(merged);
      }
    });

    const RF = `${BASE}/result/${folder}`;
    const filesToPreload = [
      ...(RESULTS[resultKey].bgFile && !isNewDesign ? ['bg.webp'] : []),
      'hero-card.webp',
      'char.webp',
    ];
    const assets = filesToPreload.map(
      f => new Promise<void>(r => { const img = new Image(); img.onload = () => r(); img.onerror = () => r(); img.src = `${RF}/${f}${CACHE_V}`; }),
    );
    Promise.all(assets).then(() => setIsLoading(false));
  }, [folder, resultKey, slug]);

  const handleLayoutChange = useCallback((patch: Partial<LayoutConfig>) => {
    setLayout(prev => ({ ...prev, ...patch }));
  }, []);

  if (!resultKey || !RESULTS[resultKey]) {
    return <Navigate to="/e/soul-guitar" replace />;
  }

  const resultData = RESULTS[resultKey];

  const bgUrl = folder && resultData.bgFile && !isNewDesign
    ? `${BASE}/result/${folder}/${encodeURIComponent(resultData.bgFile)}${CACHE_V}`
    : '';
  const stripeUrl = folder && resultData.stripeFile
    ? `${BASE}/result/${folder}/${encodeURIComponent(resultData.stripeFile)}${CACHE_V}`
    : null;

  return (
    <div
      className="w-full flex flex-col items-center overflow-x-hidden"
      style={{
        backgroundColor: resultData.themeColor,
        ...(bgUrl ? {
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        } : {
          background: resultData.themeBg,
        }),
      }}
    >
      {resultKey === 'SUN_自由' && isNewDesign && <SunGrainOverlay />}
      <AnimatePresence>
        {isLoading && <ResultLoadingScreen key="result-loading" />}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-[285px] md:max-w-[50vw]">
        <FullResultPage
          resultKey={resultKey}
          folder={RESULT_FOLDER[resultKey]}
          layout={layout}
        />
      </div>
      {!!stripeUrl && <OrganizerStripe stripeUrl={stripeUrl} />}

      {isEditMode && (
        <LayoutEditor
          slug="sun"
          layout={layout}
          onChange={handleLayoutChange}
          onReset={() => setLayout(DEFAULT_LAYOUT)}
          editKey={editKey}
        />
      )}
    </div>
  );
}
