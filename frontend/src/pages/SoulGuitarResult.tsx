import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import quizService, { type LayoutConfig, DEFAULT_LAYOUT } from '../services/quizService';

/* ──────────────────────────────────────
   Soul Guitar — 結果頁
   路由：/e/soul-guitar/:slug
   ────────────────────────────────────── */

const BASE = '/images/events/quiz';
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
    charImg: `${BASE}/result/fire/char.webp`,
    themeColor: '#E04040',
    themeBg: 'linear-gradient(135deg, #FFE0D0 0%, #F08060 50%, #E04040 100%)',
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
    charImg: `${BASE}/result/fireworks/char.webp`,
    themeColor: '#D05030',
    themeBg: 'linear-gradient(135deg, #FFE8D8 0%, #E88060 50%, #D05030 100%)',
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
    charImg: `${BASE}/result/sun/char.webp`,
    themeColor: '#FF9A3E',
    themeBg: 'linear-gradient(135deg, #FFF4CC 0%, #FFE4A0 50%, #FF9A3E 100%)',
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
    charImg: `${BASE}/result/glow/char.webp`,
    themeColor: '#F0B860',
    themeBg: 'linear-gradient(135deg, #FFF8E8 0%, #FFE8B0 50%, #F0B860 100%)',
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
    charImg: `${BASE}/result/wave/char.webp`,
    themeColor: '#4A9EC5',
    themeBg: 'linear-gradient(135deg, #E0F2FE 0%, #7EC8E3 50%, #4A9EC5 100%)',
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
    charImg: `${BASE}/result/deep-sea/char.webp`,
    themeColor: '#2E6B8A',
    themeBg: 'linear-gradient(135deg, #C8E0EC 0%, #5A9AB5 50%, #2E6B8A 100%)',
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
    charImg: `${BASE}/result/moon/char.webp`,
    themeColor: '#6B6B9E',
    themeBg: 'linear-gradient(135deg, #E8E8F0 0%, #A0A0C8 50%, #6B6B9E 100%)',
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
    charImg: `${BASE}/result/dream-moon/char.webp`,
    themeColor: '#7B6BA0',
    themeBg: 'linear-gradient(135deg, #EDE8F5 0%, #B0A0D0 50%, #7B6BA0 100%)',
  },
};

/* ── 完整圖片結果頁（所有有素材的角色共用） ── */
function FullResultPage({ resultKey, folder, layout, isEditMode, onLayoutChange }: {
  resultKey: string;
  folder: string;
  layout: LayoutConfig;
  isEditMode: boolean;
  onLayoutChange: (patch: Partial<LayoutConfig>) => void;
}) {
  const RF = `${BASE}/result/${folder}`;
  const result = RESULTS[resultKey];
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const L = layout;

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}/e/soul-guitar`;
    const text = `我的吉他靈魂是「${result.soulTitle}」！快來測測你的吉他靈魂 🎸`;
    if (navigator.share) {
      try { await navigator.share({ title: text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      ref={scrollRef}
      className="absolute inset-0 z-50 overflow-y-auto overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="relative z-10 flex flex-col items-center w-full pb-16"
        style={{
          backgroundImage: `url(${RF}/bg.webp)`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
        }}
      >

        {/* ─── Hero Card ─── */}
        <motion.div
          className="mx-auto relative"
          style={{ width: `${L.heroW}%`, marginTop: `${L.heroMt}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img src={`${RF}/hero-card.webp`} alt={result.name} className="w-full h-auto block" draggable={false} />
        </motion.div>

        <div className="w-[90%] mx-auto flex flex-col items-center">

          {/* 長按儲存提示 */}
          <motion.div
            className="mt-3"
            style={{ width: `${L.textSaveW}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 0.7 : 0, y: showContent ? [0, -3, 0] : 0 }}
            transition={{ opacity: { duration: 0.5 }, y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <img src={`${RF}/text-save.webp`} alt="長按上方結果圖儲存圖片" className="w-full h-auto" draggable={false} />
          </motion.div>

          {/* 往下看提示 */}
          <motion.div
            className="mt-4"
            style={{ width: `${L.textScrollW}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? [0, 6, 0] : 10 }}
            transition={{ opacity: { duration: 0.5, delay: 0.2 }, y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <img src={`${RF}/text-scroll.webp`} alt="往下看你的靈魂檔案" className="w-full h-auto" draggable={false} />
          </motion.div>

          {/* 一個讓你被聽見的機會 */}
          <motion.div
            className="mt-5"
            style={{ width: `${L.textChanceW}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ opacity: { duration: 0.5, delay: 0.4 } }}
          >
            <img src={`${RF}/text-chance.webp`} alt="一個讓你被聽見的機會" className="w-full h-auto" draggable={false} />
          </motion.div>

          {/* 角色圖 + 兩側文字 */}
          <motion.div
            className="mt-4 w-full relative flex justify-center overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.8, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={result.charImg} alt={result.name} style={{ width: `${L.charW}%` }} className="relative z-0 h-auto object-contain" draggable={false} />
            <img src={`${RF}/char-left.webp`} alt="" style={{ width: `${L.leftW}%`, top: `${L.leftTop}%`, left: `${L.leftLeft}%` }} className="absolute z-10 h-auto object-contain" draggable={false} />
            <img src={`${RF}/char-right.webp`} alt={result.colorName} style={{ width: `${L.rightW}%`, top: `${L.rightTop}%`, right: `${L.rightRight}%` }} className="absolute z-10 h-auto object-contain" draggable={false} />
          </motion.div>

          {/* 你的個人特質 */}
          <motion.div
            className="mt-8"
            style={{ width: `${L.personalityW}%`, perspective: 800 }}
            initial={{ opacity: 0, y: 30, rotateX: 8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: '-60px', root: scrollRef }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={`${RF}/personality-card.webp`} alt="你的個人特質" className="w-full h-auto rounded-xl" draggable={false} />
          </motion.div>

          {/* 城市卡 */}
          <motion.div
            className="mt-8 overflow-hidden rounded-xl"
            style={{ width: `${L.cityW}%` }}
            initial={{ opacity: 0, clipPath: 'inset(10% 10% 10% 10% round 12px)' }}
            whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 12px)' }}
            viewport={{ once: true, margin: '-50px', root: scrollRef }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={`${RF}/city-card.webp`} alt={result.city} className="w-full h-auto" draggable={false} />
          </motion.div>

          {/* 猜猜這是哪 */}
          <motion.div
            className="mt-5"
            style={{ width: `${L.textGuessW}%` }}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, root: scrollRef }}
            transition={{ duration: 0.5 }}
          >
            <img src={`${RF}/text-guess.webp`} alt="猜猜這是哪" className="w-full h-auto" draggable={false} />
          </motion.div>

          {/* 這樣的你，會發出什麼樣的聲音？ */}
          <motion.div
            className="mt-10"
            style={{ width: `${L.textSoundW}%` }}
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, root: scrollRef }}
            transition={{ duration: 0.6 }}
          >
            <img src={`${RF}/text-sound.webp`} alt="這樣的你，會發出什麼樣的聲音" className="w-full h-auto" draggable={false} />
          </motion.div>

          {/* 你可能會喜歡的 Ayers 吉他款式 */}
          <motion.div
            className="mt-10"
            style={{ width: `${L.titleAyersW}%` }}
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, root: scrollRef }}
            transition={{ duration: 0.5 }}
          >
            <img src={`${RF}/title-ayers.webp`} alt="你可能會喜歡的Ayers吉他款式" className="w-full h-auto" draggable={false} />
          </motion.div>

          {/* 兩把吉他 */}
          <div className="mt-5 w-full grid grid-cols-2 gap-4 items-stretch">
            {[1, 2].map(i => (
              <motion.div
                key={i}
                className="flex flex-col items-center justify-between gap-3"
                initial={{ opacity: 0, x: i === 1 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px', root: scrollRef }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative w-full h-[280px] overflow-hidden">
                  <img src={`${RF}/guitar-${i}.webp`} alt="Ayers 吉他" className="w-full h-full object-contain object-bottom" draggable={false} />
                  <img src={`${RF}/guitar-title-${i}.webp`} alt="" className="absolute top-2 left-1 w-[50%] h-auto" draggable={false} />
                </div>
                <motion.button type="button" className="w-[90%]" whileTap={{ scale: 0.93 }}>
                  <img src={`${RF}/btn-unlock-${i}.webp`} alt="解鎖它的音色" className="w-full h-auto" draggable={false} />
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* 你聽出來了嗎 */}
          <motion.div
            className="mt-8"
            style={{ width: `${L.textHeardW}%` }}
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px', root: scrollRef }}
            transition={{ duration: 0.6 }}
          >
            <img src={`${RF}/text-heard.webp`} alt="你聽出來了嗎" className="w-full h-auto" draggable={false} />
          </motion.div>

          {/* 你會愛上的吉他音樂風格 */}
          <motion.div
            className="mt-8"
            style={{ width: `${L.titleMusicW}%` }}
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, root: scrollRef }}
            transition={{ duration: 0.5 }}
          >
            <img src={`${RF}/title-music-style.webp`} alt="你會愛上的吉他音樂風格" className="w-full h-auto" draggable={false} />
          </motion.div>

          {/* 音樂風格標籤 */}
          <div className="mt-4 flex flex-col gap-2.5" style={{ width: `${L.tagsW}%` }}>
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px', root: scrollRef }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <img src={`${RF}/tag-${i}.webp`} alt="" className="w-full h-auto" draggable={false} />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-3"
            style={{ width: `${L.textContestW}%` }}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, root: scrollRef }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <img src={`${RF}/text-contest-info.webp`} alt="比賽資訊" className="w-full h-auto" draggable={false} />
          </motion.div>

          {/* 比賽海報 */}
          <motion.div
            className="mt-6 overflow-hidden rounded-xl"
            style={{ width: `${L.posterW}%` }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, root: scrollRef }}
            transition={{ duration: 0.6 }}
          >
            <img src={`${RF}/poster.webp`} alt="靈魂吉他手大賽海報" className="w-full h-auto rounded-xl" draggable={false} />
          </motion.div>

          {/* 底部按鈕 */}
          <motion.div
            className="mt-10 w-full flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, root: scrollRef }}
            transition={{ duration: 0.5 }}
          >
            <img src={`${RF}/char-type.webp`} alt="分享抽獎說明" style={{ width: `${L.charTypeW}%` }} className="h-auto self-start" draggable={false} />

            <div className="w-full flex items-center gap-3">
              <motion.button type="button" onClick={handleShare} className="flex-1 relative" whileTap={{ scale: 0.95 }}>
                <motion.div
                  className="absolute -inset-1 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(218,165,50,0.3) 0%, transparent 70%)' }}
                  animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.97, 1.03, 0.97] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <img src={`${RF}/btn-share.webp`} alt="分享你的測驗結果" className="relative w-full h-auto" draggable={false} />
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
                <img src={`${RF}/btn-retry.webp`} alt="再測一次" className="w-full h-auto" draggable={false} />
              </motion.button>
            </div>

            <Link to="/e/soul-guitar/info" className="w-full active:scale-95 transition-transform">
              <img src={`${RF}/btn-contest.webp`} alt="前往了解靈魂吉他手大賽" className="w-full h-auto" draggable={false} />
            </Link>
          </motion.div>

          <div className="h-8" />

        </div>
      </div>
    </motion.div>
  );
}

/* ── 版面編輯器（管理員用，?edit 啟用） ── */
function EditorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-amber-400 font-semibold text-[11px] border-b border-white/10 pb-1">{title}</div>
      {children}
    </div>
  );
}

function LayoutEditor({ slug, layout, onChange, onReset }: {
  slug: string;
  layout: LayoutConfig;
  onChange: (patch: Partial<LayoutConfig>) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const L = layout;

  const Slider = ({ label, prop, min, max }: { label: string; prop: keyof LayoutConfig; min: number; max: number }) => (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-26 shrink-0 text-white/60 leading-none">{label}</span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={L[prop]}
        onChange={e => onChange({ [prop]: Number(e.target.value) } as Partial<LayoutConfig>)}
        className="flex-1 accent-amber-400 h-1"
      />
      <span className="w-7 text-right text-white/90 tabular-nums font-mono">{L[prop]}</span>
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await quizService.saveLayout(slug, layout);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full z-200 flex pointer-events-none">
      {/* Toggle tab */}
      <button
        type="button"
        className="self-center pointer-events-auto bg-black/80 hover:bg-black text-white px-1 py-3 rounded-l-lg text-[10px] leading-none flex flex-col items-center gap-1 shadow-lg [writing-mode:vertical-rl]"
        onClick={() => setOpen(p => !p)}
      >
        <span>{open ? '▶' : '◀'}</span>
        <span className="rotate-180">編輯版面</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="pointer-events-auto w-64 bg-black/90 backdrop-blur-sm text-white overflow-y-auto flex flex-col gap-3 p-3 shadow-2xl text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white">版面編輯器</span>
            <button type="button" onClick={onReset} className="text-red-400 hover:text-red-300 text-[11px]">重置預設</button>
          </div>

          <EditorSection title="Hero 卡">
            <Slider label="寬度 %" prop="heroW" min={40} max={100} />
            <Slider label="上邊距 %" prop="heroMt" min={0} max={30} />
          </EditorSection>

          <EditorSection title="角色圖">
            <Slider label="寬度 %" prop="charW" min={30} max={100} />
          </EditorSection>

          <EditorSection title="左側裝飾">
            <Slider label="寬度 %" prop="leftW" min={5} max={40} />
            <Slider label="上 %" prop="leftTop" min={0} max={80} />
            <Slider label="左 %" prop="leftLeft" min={-10} max={20} />
          </EditorSection>

          <EditorSection title="右側裝飾">
            <Slider label="寬度 %" prop="rightW" min={5} max={40} />
            <Slider label="上 %" prop="rightTop" min={0} max={80} />
            <Slider label="右 %" prop="rightRight" min={-10} max={20} />
          </EditorSection>

          <EditorSection title="文字元素">
            <Slider label="儲存提示" prop="textSaveW" min={20} max={100} />
            <Slider label="往下看" prop="textScrollW" min={20} max={100} />
            <Slider label="機會文字" prop="textChanceW" min={20} max={100} />
            <Slider label="猜猜這是哪" prop="textGuessW" min={20} max={100} />
            <Slider label="發出什麼聲音" prop="textSoundW" min={20} max={100} />
            <Slider label="聽出來了嗎" prop="textHeardW" min={20} max={100} />
            <Slider label="角色型標籤" prop="charTypeW" min={20} max={100} />
          </EditorSection>

          <EditorSection title="卡片 / 圖塊">
            <Slider label="個人特質卡" prop="personalityW" min={40} max={100} />
            <Slider label="城市卡" prop="cityW" min={40} max={100} />
            <Slider label="Ayers 標題" prop="titleAyersW" min={20} max={100} />
            <Slider label="音樂風格標題" prop="titleMusicW" min={20} max={100} />
            <Slider label="音樂風格標籤" prop="tagsW" min={40} max={100} />
            <Slider label="比賽資訊文字" prop="textContestW" min={40} max={100} />
            <Slider label="比賽海報" prop="posterW" min={40} max={100} />
          </EditorSection>

          <div className="flex gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-1.5 rounded text-xs transition-colors"
            >
              {saving ? '儲存中…' : saved ? '已儲存 ✓' : '儲存設定'}
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
      <img src={`${BASE}/loading.webp`} alt="載入中" className="w-40 h-40 object-contain" draggable={false} />
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
  const { pathname, search, state } = useLocation();
  const slug = pathname.replace('/e/soul-guitar/', '').replace(/\/$/, '');
  const resultKey = SLUG_TO_KEY[slug];
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT);
  const [isEditMode] = useState(() => new URLSearchParams(search).has('edit'));

  // 直接開結果頁 URL（非做完測驗跳過來）→ 導回封面
  if (resultKey && !(state as { fromQuiz?: boolean } | null)?.fromQuiz && !isEditMode) {
    return <Navigate to="/e/soul-guitar" replace />;
  }

  const folder = resultKey ? RESULT_FOLDER[resultKey] : null;

  useEffect(() => {
    if (!folder || !resultKey) return;

    // Track this result (fire-and-forget, won't break UX on failure)
    quizService.trackResult(slug, resultKey);

    // Load saved layout from DB; fall back to DEFAULT_LAYOUT if none exists
    quizService.getLayout(slug).then(cfg => { if (cfg) setLayout(cfg); });

    const RF = `${BASE}/result/${folder}`;
    const min = new Promise(r => setTimeout(r, 1500));
    const assets = ['bg.webp', 'hero-card.webp', 'char.webp'].map(
      f => new Promise<void>(r => { const img = new Image(); img.onload = () => r(); img.onerror = () => r(); img.src = `${RF}/${f}`; }),
    );
    Promise.all([min, ...assets]).then(() => setIsLoading(false));
  }, [folder, resultKey, slug]);

  const handleLayoutChange = useCallback((patch: Partial<LayoutConfig>) => {
    setLayout(prev => ({ ...prev, ...patch }));
  }, []);

  if (!resultKey || !RESULTS[resultKey]) {
    return <Navigate to="/e/soul-guitar" replace />;
  }

  const resultData = RESULTS[resultKey];

  return (
    <div
      className="w-full min-h-dvh relative flex justify-center"
      style={{ background: `linear-gradient(180deg, ${resultData.themeColor}30 0%, #111 40%)` }}
    >
      <AnimatePresence>
        {isLoading && <ResultLoadingScreen key="result-loading" />}
      </AnimatePresence>
      <div className="w-full max-w-[430px] relative min-h-dvh">
        <FullResultPage
          resultKey={resultKey}
          folder={RESULT_FOLDER[resultKey]}
          layout={layout}
          isEditMode={isEditMode}
          onLayoutChange={handleLayoutChange}
        />
      </div>
      {isEditMode && (
        <LayoutEditor
          slug={slug}
          layout={layout}
          onChange={handleLayoutChange}
          onReset={() => setLayout(DEFAULT_LAYOUT)}
        />
      )}
    </div>
  );
}
