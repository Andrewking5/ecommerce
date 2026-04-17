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
  'fire':       'FIRE_自由',   // 火焰
  'fireworks':  'FIRE_故事',   // 煙火
  'sun':        'SUN_自由',    // 太陽
  'glow':       'SUN_故事',    // 微光
  'wave':       'WAVE_自由',   // 海浪
  'deep-sea':   'WAVE_故事',   // 深海
  'moon':       'MOON_故事',   // 月亮
  'dream-moon': 'MOON_自由',   // 夢月
};

/* ── 角色 → 素材資料夾 ── */
const RESULT_FOLDER: Record<string, string> = {
  FIRE_自由:  'fire',
  FIRE_故事:  'fireworks',
  SUN_自由:   'sun',
  SUN_故事:   'glow',
  WAVE_自由:  'wave',
  WAVE_故事:  'deep-sea',
  MOON_故事:  'moon',
  MOON_自由:  'dream-moon',
};

const FOOTER_BASE = `${BASE}/result/sun`;
const enc = (name: string) => encodeURIComponent(name);

/**
 * 響應式背景層（z-0，absolute inset-0）
 * <picture> 自動切換手機版 / 桌機版背景
 * object-fit: fill → 整張圖撐滿 container，不留空白
 */
function BackgroundLayer({ bgUrl, bgMobileUrl }: { bgUrl: string; bgMobileUrl?: string }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <picture className="absolute inset-0 w-full h-full">
        {/* 桌機：≥ 1024px 用桌機版 */}
        <source media="(min-width: 1024px)" srcSet={bgUrl} />
        {/* 手機：用手機版（若無則 fallback 到桌機版） */}
        <img
          src={bgMobileUrl ?? bgUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      </picture>
    </div>
  );
}

/**
 * 布條 + logos — 專業響應式做法
 * - 布條圖固定高度（不隨寬度無限放大），`object-fit: cover` 填滿
 * - logos 高度跟著布條，`py` 控制上下留白
 * - 文字大小 clamp，手機~桌機都合理
 */
function OrganizerStripe({ stripeUrl }: { stripeUrl: string }) {
  /* 布條高度：手機 52px，隨螢幕略增，桌機上限 68px */
  const stripeH = 'clamp(52px, 7vw, 68px)';
  return (
    <div
      className="relative z-10 w-full"
      style={{ height: stripeH, fontFamily: QUIZ_FONT }}
    >
      {/* 布條背景圖 */}
      <img
        src={stripeUrl}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* logos 疊在布條上，置中，每個元素間距 10px */}
      <div className="relative h-full flex items-center justify-center px-4 gap-[10px] overflow-hidden">
        <div className="flex items-center gap-[10px] shrink-0 h-full py-2">
          <span className="text-white/80 text-[clamp(8px,1vw,11px)] whitespace-nowrap">主辦方</span>
          <img src={`${FOOTER_BASE}/ayers.png`} alt="Ayers" className="h-full w-auto object-contain" draggable={false} />
        </div>
        <div className="flex items-center gap-[10px] shrink-0 h-full py-2">
          <span className="text-white/80 text-[clamp(8px,1vw,11px)] whitespace-nowrap">協辦</span>
          <img src={`${FOOTER_BASE}/${enc('協辦 聲潮.png')}`}                  alt="聲潮"    className="h-full w-auto object-contain" draggable={false} />
          <img src={`${FOOTER_BASE}/${enc('協辦91譜.png')}`}                    alt="91譜"    className="h-full w-auto object-contain" draggable={false} />
          <img src={`${FOOTER_BASE}/${enc('協辦 生為吉他人 死為吉他魂.png')}`} alt="生吉他魂" className="h-full w-auto object-contain" draggable={false} />
        </div>
        <div className="flex items-center gap-[10px] shrink-0 h-full py-2">
          <span className="text-white/80 text-[clamp(8px,1vw,11px)] whitespace-nowrap">贊助</span>
          <img src={`${FOOTER_BASE}/${enc('贊助 雲聲.png')}`} alt="雲聲" className="h-full w-auto object-contain" draggable={false} />
          <img src={`${FOOTER_BASE}/${enc('贊助 奧昇.png')}`} alt="奧昇" className="h-full w-auto object-contain" draggable={false} />
        </div>
      </div>
    </div>
  );
}

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
  bgFile?: string;       // 桌機背景（1920px 基準）
  bgFileMobile?: string; // 手機背景（430px 基準，若無則同 bgFile）
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
    bgFileMobile: 'bg-mobile.webp',
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
    stripeFile: '資產 28.png',
  },
};

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
      audio.play().then(() => setAudioPlaying(true)).catch(() => {});
    }
  };

  const handleShare = async () => {
    // 分享連結帶 ?s=1 讓收到的人能直接看到結果頁
    const shareUrl = `${window.location.origin}/e/soul-guitar/${folder}?s=1`;
    const shareText = `我的吉他靈魂是「${result.soulTitle}」！快來測測你的 🎸測驗完成再來報名「靈魂吉他手大賽」，總獎金高達20萬元！`;

    // 1. 嘗試帶圖分享（iOS Safari 15+ / Android Chrome 支援）
    if (navigator.share) {
      try {
        const imgSrc = `${RF}/hero-card.webp${CACHE_V}`;
        const blob = await fetch(imgSrc).then(r => r.blob());
        const file = new File([blob], 'my-guitar-soul.webp', { type: blob.type });

        if (navigator.canShare?.({ files: [file] })) {
          // 帶圖片分享（LINE、IG Stories、訊息 app 可直接貼）
          await navigator.share({ title: shareText, text: shareText, url: shareUrl, files: [file] });
        } else {
          // 不支援帶檔案 → 只分享文字+連結
          await navigator.share({ title: shareText, text: shareText, url: shareUrl });
        }
        return;
      } catch {
        // 使用者取消或失敗 → 不做任何事
        return;
      }
    }

    // 2. 桌機 fallback：複製連結
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-50">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      )}
    </motion.button>

    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative z-10 flex flex-col items-center w-full pb-16">

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
            style={{ marginTop: `${C.char.mt}px` }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.8, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={result.charImg}
              alt={result.name}
              style={{ width: `${C.char.w}%`, transform: `translate(${C.char.x}px, ${C.char.y}px)`, zIndex: C.char.z }}
              className="relative h-auto object-contain"
              draggable={false}
            />
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
          <div className="mt-5 w-full grid grid-cols-2 gap-4 items-stretch">
            {[1, 2].map(i => (
              <motion.div
                key={i}
                className="flex flex-col items-center justify-between gap-3"
                initial={{ opacity: 0, x: i === 1 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="w-full">
                  <img src={`${RF}/guitar-${i}.webp${CACHE_V}`} alt="Ayers 吉他" className="w-full h-auto object-contain" draggable={false} />
                </div>
                <motion.button type="button" className="w-[90%]" whileTap={{ scale: 0.93 }}>
                  <img src={`${RF}/btn-unlock-${i}.webp${CACHE_V}`} alt="解鎖它的音色" className="w-full h-auto" draggable={false} />
                </motion.button>
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
          <div className="flex flex-col gap-2.5" style={fs('tags')}>
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
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
            className="mt-10 w-full flex flex-col items-center gap-4"
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

            <div className="w-full flex items-center gap-3">
              <motion.button
                type="button"
                onClick={handleShare}
                className="flex-1 relative"
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
              <motion.button type="button" onClick={() => navigate('/e/soul-guitar')} className="flex-1" whileTap={{ scale: 0.93 }}>
                <img src={`${RF}/btn-retry.webp${CACHE_V}`} alt="再測一次" className="w-full h-auto" draggable={false} />
              </motion.button>
            </div>

            <Link to="/e/soul-guitar/info" className="w-full active:scale-95 transition-transform">
              <img src={`${RF}/btn-contest.webp${CACHE_V}`} alt="前往了解靈魂吉他手大賽" className="w-full h-auto" draggable={false} />
            </Link>
          </motion.div>

          <div className="h-8" />

        </div>
      </div>

    </motion.div>
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
  { key: 'heroCard',        label: 'Hero 結果卡',    wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'textSave',        label: '長按儲存提示',   wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'textScroll',      label: '往下看提示',     wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'textChance',      label: '機會文字',       wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'char',            label: '角色圖',         wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'charRight',       label: '右側裝飾', abs: true, wMin: 0, wMax: 150, mtMin: -50, mtMax: 200, xMin: -50, xMax: 100, zMin: 0, zMax: 50 },
  { key: 'personalityCard', label: '個人特質卡',     wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'cityCard',        label: '城市卡',         wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'textGuess',       label: '猜猜這是哪',     wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'textSound',       label: '發出什麼聲音',   wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'titleAyers',      label: 'Ayers 吉他標題', wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'textHeard',       label: '你聽出來了嗎',   wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'titleMusic',      label: '音樂風格標題',   wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'tags',            label: '音樂風格標籤',   wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'textContest',     label: '比賽資訊文字',   wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'poster',          label: '比賽海報',       wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'charType',        label: '角色型標籤',     wMin: 0, wMax: 200, mtMin: -300, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300 },
  { key: 'footerBlob',      label: '底部吉他背景',   wMin: 0, wMax: 200, mtMin: -600, mtMax: 600, xMin: -300, xMax: 300, yMin: -300, yMax: 300, zMin: 0, zMax: 50 },
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

  // 更新某素材的單一屬性
  const update = (key: AssetKey, field: keyof typeof layout[AssetKey], value: number) => {
    onChange({ [key]: { ...layout[key], [field]: value } } as Partial<LayoutConfig>);
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
                          <Slider label={key === 'charLeft' ? '左 left%' : '右 right%'} value={c.x} min={xMin} max={xMax} onChange={v => update(key, 'x', v)} />
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

          {/* 底部固定儲存 */}
          <div className="sticky bottom-0 bg-black/95 px-3 py-2 border-t border-white/10">
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
  const editKey = searchParams.get('edit') || '';
  const isSharedLink = new URLSearchParams(search).has('s'); // ?s=1 = 從分享連結來
  // useState 初始化只跑一次，避免 re-render 時 sessionStorage 已被清除導致誤 redirect
  const [fromQuiz] = useState(() => sessionStorage.getItem('soulGuitar_fromQuiz') === '1');
  const shouldRedirect = !!resultKey && !fromQuiz && !isEditMode && !isSharedLink;

  const folder = resultKey ? RESULT_FOLDER[resultKey] : null;

  // 清除 sessionStorage flag（只跑一次，在 render 之後）
  useEffect(() => {
    sessionStorage.removeItem('soulGuitar_fromQuiz');
  }, []);

  useEffect(() => {
    if (!folder || !resultKey || shouldRedirect) return;

    // Track this result (fire-and-forget, won't break UX on failure)
    quizService.trackResult(slug, resultKey);

    // Load saved layout from DB; fall back to DEFAULT_LAYOUT if none exists
    quizService.getLayout(slug).then(cfg => { if (cfg) setLayout(cfg); });

    const RF = `${BASE}/result/${folder}`;
    const assets = ['bg.webp', 'hero-card.webp', 'char.webp'].map(
      f => new Promise<void>(r => { const img = new Image(); img.onload = () => r(); img.onerror = () => r(); img.src = `${RF}/${f}${CACHE_V}`; }),
    );
    Promise.all(assets).then(() => setIsLoading(false));
  }, [folder, resultKey, slug, shouldRedirect]);

  const handleLayoutChange = useCallback((patch: Partial<LayoutConfig>) => {
    setLayout(prev => ({ ...prev, ...patch }));
  }, []);

  // 直接開結果頁 URL（非做完測驗、非分享連結）→ 導回封面（必須在所有 hooks 之後）
  if (shouldRedirect) {
    return <Navigate to="/e/soul-guitar" replace />;
  }

  if (!resultKey || !RESULTS[resultKey]) {
    return <Navigate to="/e/soul-guitar" replace />;
  }

  const resultData = RESULTS[resultKey];

  const bgFile = resultData.bgFile ?? 'bg.webp';
  const bgUrl = folder ? `${BASE}/result/${folder}/${encodeURIComponent(bgFile)}${CACHE_V}` : '';
  const stripeUrl = folder && resultData.stripeFile
    ? `${BASE}/result/${folder}/${encodeURIComponent(resultData.stripeFile)}${CACHE_V}`
    : null;

  return (
    <div
      className="w-full relative flex flex-col items-center overflow-x-hidden"
      style={{ backgroundColor: resultData.themeColor, minHeight: '100dvh' }}
    >
      {/* z-0：背景層（太陽.jpg object-cover + 資産29 底部置中） */}
      {!!resultData.bgFile && <BackgroundLayer bgUrl={bgUrl} />}

      <AnimatePresence>
        {isLoading && <ResultLoadingScreen key="result-loading" />}
      </AnimatePresence>

      {/* z-10：內容層（手機 80% = 344px，電腦 120% = 516px） */}
      <div className="relative z-10 w-full max-w-[344px] md:max-w-[430px] lg:max-w-[602px]">
        <FullResultPage
          resultKey={resultKey}
          folder={RESULT_FOLDER[resultKey]}
          layout={layout}
        />
      </div>

      {/* z-10：布條 + logos，頁面最底部 */}
      {!!stripeUrl && <OrganizerStripe stripeUrl={stripeUrl} />}

      {isEditMode && (
        <LayoutEditor
          slug={slug}
          layout={layout}
          onChange={handleLayoutChange}
          onReset={() => setLayout(DEFAULT_LAYOUT)}
          editKey={editKey}
        />
      )}
    </div>
  );
}
