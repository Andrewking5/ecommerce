import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

/* ──────────────────────────────────────
   Soul Guitar — 心理測驗
   純背景 + 標題圖片分離，完整 RWD
   手機 9:16 / 電腦 16:9
   ────────────────────────────────────── */

const BASE = '/images/events/quiz';
const CACHE_V = '?v=2'; // cache bust
const QUIZ_FONT = '"Glow Sans TC", "Noto Sans TC", sans-serif';

const V = CACHE_V;
const questions = [
  { id: 1, bg: `${BASE}/q1.webp${V}`, bgWide: `${BASE}/q1-wide.webp${V}`, questionText: '如果今天突然有一整天的空閒，你最想？', options: ['找一家舒服的小店坐著放鬆', '隨便出門走走看看城市', '待在房間聽歌或想事情', '找朋友出去玩熱鬧一下'] },
  { id: 2, bg: `${BASE}/q2.webp${V}`, bgWide: `${BASE}/q2-wide.webp${V}`, questionText: '如果有一首歌讓你反覆聽很多次，通常是因為？', options: ['旋律很溫暖很好聽', '整體感覺很自由很流動', '歌詞或氛圍很有情緒', '節奏很強讓人很想跳舞'] },
  { id: 3, bg: `${BASE}/q3.webp${V}`, bgWide: `${BASE}/q3-wide.webp${V}`, questionText: '如果要去聽一場現場音樂，你比較想去？', options: ['小咖啡店 acoustic 演出', '戶外音樂表演', '深夜小酒吧', 'Live House 現場演出'] },
  { id: 4, bg: `${BASE}/q4.webp${V}`, bgWide: `${BASE}/q4-wide.webp${V}`, questionText: '如果你的生活是一種風景，它比較像？', options: ['和朋友在咖啡店聊天的午後', '海邊吹著風的海岸', '月光下安靜的夜晚', '充滿歡聲笑語居酒屋之夜'] },
  { id: 5, bg: `${BASE}/q5.webp${V}`, bgWide: `${BASE}/q5-wide.webp${V}`, questionText: '當你聽音樂時，你比較常呈現什麼樣的狀態？', options: ['覺得心情變得很舒服', '開始想像很多畫面', '想到很多回憶', '跟著節奏點頭或動起來'] },
  { id: 6, bg: `${BASE}/q6.webp${V}`, bgWide: `${BASE}/q6-wide.webp${V}`, questionText: '朋友們通常在什麼樣的場合最容易想到你？', options: ['需要有人陪著聊天、\n分享心事的時候', '突然想出門、\n說走就走的時候', '當想一個人靜靜待著、\n但又不想完全孤單的時候', '需要有人把氣氛炒熱、\n帶動大家的時候'] },
  { id: 7, bg: `${BASE}/q7.webp${V}`, bgWide: `${BASE}/q7-wide.webp${V}`, questionText: '如果你走在街上突然聽到有人彈吉他，你通常會？', options: ['停下來聽一下，\n看看是不是熟悉的旋律', '邊走邊聽，\n覺得街道變得很有感覺', '站遠一點靜靜聽完整首，\n能低調就低調', '忍不住走近一點，想看\n清楚表演者演出當下的樣子'] },
];

const CHARACTER_NAMES = ['火焰', '太陽', '煙火', '微光', '海浪', '深海', '月光'];

function useIsDesktop() {
  const [d, setD] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setD(mq.matches);
    const h = (e: MediaQueryListEvent) => setD(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return d;
}

/* ── 按鈕 ── */
function QuizOption({ label, onClick, delay, active }: { label: string; onClick: () => void; delay: number; active: boolean }) {
  return (
    <motion.button type="button" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }} whileTap={{ scale: 0.96 }} onClick={onClick} className="w-full cursor-pointer group relative">
      <img src={`${BASE}/btn-default.png`} alt="" className={`w-full h-auto transition-opacity duration-200 ${active ? 'opacity-0' : 'group-hover:opacity-0'}`} draggable={false} />
      <img src={`${BASE}/btn-selected.png`} alt="" className={`absolute inset-0 w-full h-auto transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} draggable={false} />
      <span className={`absolute inset-0 flex items-center justify-center text-[1.1rem] leading-snug transition-colors duration-200 whitespace-pre-line text-center px-4 ${active ? 'text-white' : 'text-[#2a2a2a] group-hover:text-white'}`} style={{ fontFamily: QUIZ_FONT }}>{label}</span>
    </motion.button>
  );
}

/* ── 進度條（優化版） ── */
function ProgressBar({ current }: { current: number }) {
  const progress = (current / (CHARACTER_NAMES.length - 1)) * 100;

  return (
    <div className="w-full">
      <div className="relative flex items-end justify-between">
        {/* 底線 — 灰色 */}
        <div className="absolute left-4 right-4 bottom-[5px] md:bottom-[6px] h-[1.5px]">
          <img src={`${BASE}/progress/line.png`} alt="" className="w-full h-full object-fill opacity-30" draggable={false} />
        </div>
        {/* 進度線 — 漸層填充到當前位置 */}
        <div
          className="absolute left-4 bottom-[5px] md:bottom-[6px] h-[2px] rounded-full transition-all duration-500"
          style={{
            width: `calc(${progress}% * (100% - 32px) / 100)`,
            background: 'linear-gradient(90deg, #c5a059, #6ba3b5)',
          }}
        />

        {CHARACTER_NAMES.map((name, i) => {
          const isCurrent = i === current;
          const isPast = i < current;
          const isFuture = i > current;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center">
              {/* 角色圖示 */}
              <motion.div
                className="relative"
                animate={{
                  scale: isCurrent ? 1.3 : 1,
                  opacity: isFuture ? 0.25 : 1,
                  filter: isFuture ? 'grayscale(100%)' : 'grayscale(0%)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <img
                  src={`${BASE}/progress/char-${i + 1}.png`}
                  alt={name}
                  className="w-6 h-6 md:w-7 md:h-7 object-contain"
                  draggable={false}
                />
                {/* 當前角色發光 */}
                {isCurrent && (
                  <motion.div
                    className="absolute -inset-1 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.3) 0%, transparent 70%)' }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </motion.div>
              {/* 圓點 */}
              <motion.div
                className={`w-2 h-2 md:w-2.5 md:h-2.5 mt-1 rounded-full ${
                  isCurrent ? 'bg-[#c5a059]' : isPast ? 'bg-[#8a8478]' : 'bg-[#d4d0c8]'
                }`}
                animate={{ scale: isCurrent ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Loading ── */
function LoadingScreen({ onDone, isDesktop }: { onDone: () => void; isDesktop: boolean }) {
  useEffect(() => {
    const min = new Promise((r) => setTimeout(r, 1500));
    const imgs = questions.flatMap((q) => [q.bg, q.bgWide]).map(
      (src) => new Promise<void>((r) => { const img = new Image(); img.onload = () => r(); img.onerror = () => r(); img.src = src; }),
    );
    const btns = ['/btn-default.png', '/btn-selected.png'].map(
      (f) => new Promise<void>((r) => { const img = new Image(); img.onload = () => r(); img.onerror = () => r(); img.src = `${BASE}${f}`; }),
    );
    Promise.all([min, ...imgs, ...btns]).then(onDone);
  }, [onDone, isDesktop]);

  return (
    <motion.div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0e8]" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <motion.img src={`${BASE}/loading.png`} alt="載入中" className="w-40 h-40 object-contain" animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} draggable={false} />
      <motion.p className="mt-6 text-[#2a2a2a]/60 text-sm tracking-widest" style={{ fontFamily: QUIZ_FONT }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>正在為你準備測驗⋯</motion.p>
      <motion.p
        className="mt-4 text-[#2a2a2a]/40 text-xs flex items-center gap-1.5"
        style={{ fontFamily: QUIZ_FONT }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-base">🔊</span> 建議開啟聲音，體驗更佳
      </motion.p>
    </motion.div>
  );
}

/* ── 封面 ── */
function CoverPage({ onStart, isDesktop }: { onStart: () => void; isDesktop: boolean }) {
  return (
    <motion.div className="absolute inset-0 z-50 overflow-hidden" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      {isDesktop ? (
        <img src={`${BASE}/cover-bg-wide.webp`} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      ) : (
        <video className="absolute inset-0 w-full h-full object-cover" src="/videos/soul-guitar-cover.mp4" autoPlay loop muted playsInline />
      )}
      <motion.button type="button" onClick={onStart}
        className="absolute z-10 left-1/2 -translate-x-1/2 bottom-[12%] w-[50%] max-w-[260px] md:w-[20%] md:max-w-[300px] active:scale-95 transition-transform"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, filter: ['drop-shadow(0 0 0px rgba(218,165,50,0.2))', 'drop-shadow(0 0 14px rgba(218,165,50,0.7))', 'drop-shadow(0 0 0px rgba(218,165,50,0.2))'] }}
        transition={{ opacity: { duration: 0.6, delay: 0.5 }, y: { duration: 0.6, delay: 0.5 }, filter: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
        whileTap={{ scale: 0.95 }}
      >
        <img src={`${BASE}/cover-start-btn.png`} alt="解鎖你的吉他靈魂檔案" className="w-full h-auto" draggable={false} />
      </motion.button>
      <div className="absolute z-10 bottom-0 left-0 right-0 h-9 overflow-hidden" style={{ background: 'linear-gradient(90deg, #c5a059 0%, #a0a068 35%, #6a9a8a 65%, #4a7a8a 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="flex items-center h-full w-[200%]" style={{ animation: 'marquee 15s linear infinite' }}>
            <div className="flex items-center justify-around w-1/2"><img src={`${BASE}/cover-marquee.png`} alt="" className="h-4.5 w-auto" draggable={false} /></div>
            <div className="flex items-center justify-around w-1/2"><img src={`${BASE}/cover-marquee.png`} alt="" className="h-4.5 w-auto" draggable={false} /></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── 題目頁面（通用：手機＋電腦共用邏輯） ── */
function QuestionView({
  question, currentQ, isFirstQ, isDesktop, tapped,
  onSelect, onPrev,
}: {
  question: typeof questions[0]; currentQ: number; isFirstQ: boolean; isDesktop: boolean;
  tapped: number | null; onSelect: (i: number) => void; onPrev: () => void;
}) {
  return (
    <div className="relative z-10 flex flex-col h-full">
      {/* 上一題 */}
      {!isFirstQ && (
        <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onPrev}
          className="absolute top-4 left-4 z-20 flex items-center gap-0.5 rounded-full bg-white/40 backdrop-blur-sm pl-1 pr-2.5 py-1 text-[#2a2a2a]/70 hover:bg-white/60 hover:text-[#2a2a2a] transition-all md:top-6 md:left-6 md:pl-2 md:pr-3.5 md:py-1.5">
          <ChevronLeft size={14} className="md:w-4 md:h-4" />
          <span className="text-[10px] md:text-xs" style={{ fontFamily: QUIZ_FONT }}>上一題</span>
        </motion.button>
      )}

      {/* 上半留白 */}
      <div className="flex-none h-[35%] md:h-[20%]" />

      {/* 內容區 — 電腦版置中 */}
      <div className="px-5 md:px-0 md:mx-auto md:w-[40%] md:max-w-[480px]">
        {/* 手機版：進度條在 Q 上方 */}
        <div className="md:hidden mb-2">
          <ProgressBar current={currentQ} />
        </div>

        {/* Q 號碼 */}
        <motion.span
          className="text-[2.4rem] md:text-[2.8rem] leading-none block mb-1"
          style={{
            fontFamily: QUIZ_FONT,
            fontWeight: 900,
            color: '#2a2a2a',
            textShadow: '-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 0 -1.5px 0 #fff, 0 1.5px 0 #fff, -1.5px 0 0 #fff, 1.5px 0 0 #fff',
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          Q{question.id}
        </motion.span>

        {/* 問題文字 */}
        <motion.p
          className="text-[1.35rem] md:text-[1.5rem] leading-snug mb-4"
          style={{
            fontFamily: QUIZ_FONT,
            fontWeight: 900,
            color: '#2a2a2a',
            textShadow: '-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 0 -1.5px 0 #fff, 0 1.5px 0 #fff, -1.5px 0 0 #fff, 1.5px 0 0 #fff',
          }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {question.questionText}
        </motion.p>

        {/* 選項按鈕 */}
        <div className="flex flex-col gap-2.5 md:gap-3">
          {question.options.map((opt, i) => (
            <QuizOption key={`${currentQ}-${i}`} label={opt} onClick={() => onSelect(i)} delay={0.05 + i * 0.06} active={tapped === i} />
          ))}
        </div>

        {/* 電腦版：進度條在選項下方 */}
        <div className="hidden md:block mt-6">
          <ProgressBar current={currentQ} />
        </div>
      </div>

      {/* 底部彈性空間 */}
      <div className="flex-1" />
    </div>
  );
}

/* ──────────────────────────────────────
   主元件
   ────────────────────────────────────── */
export default function SoulGuitarQuiz() {
  const isDesktop = useIsDesktop();
  const [phase, setPhase] = useState<'cover' | 'loading' | 'quiz'>('cover');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [tapped, setTapped] = useState<number | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const question = questions[currentQ];
  const isFirstQ = currentQ === 0;

  const handleStart = () => {
    if (!bgmRef.current) {
      const audio = new Audio('/audio/quiz-bg.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      bgmRef.current = audio;
    }
    bgmRef.current.play().catch(() => {});
    setPhase('loading');
  };

  const handleSelect = (i: number) => {
    if (tapped !== null) return;
    setTapped(i);
    const a = [...answers]; a[currentQ] = i; setAnswers(a);
    setTimeout(() => {
      setTapped(null);
      if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
    }, 500);
  };

  const handlePrev = () => { if (currentQ > 0) setCurrentQ(currentQ - 1); };

  const fadeVariants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };
  const currentBg = phase === 'quiz' ? (isDesktop ? question.bgWide : question.bg) : `${BASE}/cover-bg.webp`;

  return (
    <div className="w-full min-h-dvh flex items-center justify-center relative overflow-hidden bg-black">
      {/* 模糊背景 — IG Story（手機版兩側） */}
      {!isDesktop && (
        <div className="absolute inset-0 bg-cover bg-center blur-lg scale-105 brightness-[0.35] transition-all duration-500" style={{ backgroundImage: `url(${currentBg})` }} />
      )}

      {/* ===== 容器 ===== */}
      <div
        className={isDesktop
          ? 'relative w-full overflow-hidden'
          : 'relative h-dvh mx-auto overflow-hidden'
        }
        style={isDesktop
          ? { height: 'min(100dvh, calc(100vw * 9 / 16))', maxWidth: 'calc(100dvh * 16 / 9)' }
          : { width: 'min(100vw, calc(100dvh * 9 / 16))' }
        }
      >
        <AnimatePresence>
          {phase === 'cover' && <CoverPage onStart={handleStart} isDesktop={isDesktop} />}
          {phase === 'loading' && <LoadingScreen onDone={() => setPhase('quiz')} isDesktop={isDesktop} />}
        </AnimatePresence>

        {phase === 'quiz' && (
          <AnimatePresence>
            <motion.div key={currentQ} variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0">
              {/* 純背景圖 */}
              <img src={isDesktop ? question.bgWide : question.bg} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
              {/* 題目互動層 */}
              <QuestionView question={question} currentQ={currentQ} isFirstQ={isFirstQ} isDesktop={isDesktop} tapped={tapped} onSelect={handleSelect} onPrev={handlePrev} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
