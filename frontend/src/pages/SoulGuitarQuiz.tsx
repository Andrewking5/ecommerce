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

/* ── 角色閒聊台詞（3 秒沒選就出現） ── */
const CHARACTER_LINES: string[][] = [
  // Q1 — 火焰：熱情衝動
  ['欸欸快選啦！想太久火都要滅了🔥', '哪有人放假還在猶豫的啦！', '直覺直覺！不要想太多！', '我已經等到快燒起來了⋯'],
  // Q2 — 太陽：溫暖陽光
  ['慢慢來沒關係～但我快曬到融化了☀️', '每首歌都有它的故事呢～', '想一下也好，音樂值得被認真對待', '選哪個都很棒的！相信自己～'],
  // Q3 — 煙火：華麗短暫
  ['快點快點！精彩的瞬間不等人的✨', '哇這題好難選！但煙火不能等太久～', '想像一下那個畫面，答案就出來了！', '別猶豫！最閃亮的選擇就是現在！'],
  // Q4 — 微光：安靜溫柔
  ['沒關係，慢慢想⋯我會在這裡等你🕯️', '每個風景都很美，就像你一樣', '靜靜感受一下，答案會自己浮現的', '不急不急，微光最懂等待的美'],
  // Q5 — 海浪：自由奔放
  ['跟著感覺走就對了🌊～', '音樂就像海浪，讓它帶著你吧', '想太多就不自由了喔！', '隨波逐流也是一種答案啦～'],
  // Q6 — 深海：神秘深沉
  ['⋯⋯（在深海裡安靜地等你）🫧', '有些答案藏在最深的地方', '不用急，深海的時間流動得很慢', '潛入內心深處，你會找到答案的'],
  // Q7 — 月光：浪漫感性
  ['月光不催人，但夜不會永遠等你🌙', '這是最後一題了，好好感受吧', '街頭的吉他聲⋯你聽見了嗎？', '用心去選，這會成為你的靈魂記憶'],
];

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

/* ── 閒聊計時 hook ── */
function useIdleLine(currentQ: number) {
  const [lineIdx, setLineIdx] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLineIdx(-1);
    const scheduleNext = () => {
      const delay = 6000 + Math.random() * 4000;
      intervalRef.current = setTimeout(() => {
        setLineIdx((prev) => (prev + 1) % CHARACTER_LINES[currentQ].length);
        scheduleNext();
      }, delay);
    };
    timerRef.current = setTimeout(() => { setLineIdx(0); scheduleNext(); }, 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [currentQ]);

  const lines = CHARACTER_LINES[currentQ];
  return lineIdx >= 0 && lines ? lines[lineIdx] : null;
}

/* ── 按鈕 ── */
function QuizOption({ label, onClick, delay, active }: { label: string; onClick: () => void; delay: number; active: boolean }) {
  return (
    <motion.button type="button" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }} whileTap={{ scale: 0.96 }} onClick={onClick} className="w-full cursor-pointer group relative">
      <img src={`${BASE}/btn-default.png`} alt="" className={`w-full h-auto transition-opacity duration-200 ${active ? 'opacity-0' : 'group-hover:opacity-0'}`} draggable={false} />
      <img src={`${BASE}/btn-selected.png`} alt="" className={`absolute inset-0 w-full h-auto transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} draggable={false} />
      <span className={`absolute inset-0 flex items-center justify-center text-[0.9rem] md:text-[1.1rem] leading-snug transition-colors duration-200 whitespace-pre-line text-center px-4 ${active ? 'text-white' : 'text-[#2a2a2a] group-hover:text-white'}`} style={{ fontFamily: QUIZ_FONT }}>{label}</span>
    </motion.button>
  );
}

/* ── 進度條（含角色氣泡） ── */
function ProgressBar({ current, idleLine, bubbleAbove }: { current: number; idleLine: string | null; bubbleAbove?: boolean }) {
  const progress = (current / (CHARACTER_NAMES.length - 1)) * 100;
  const isTalking = idleLine !== null;

  return (
    <div className="w-full">
      <div className="relative flex items-end justify-between">
        {/* 底線 */}
        <div className="absolute left-4 right-4 bottom-[5px] md:bottom-[6px] h-[2px]">
          <img src={`${BASE}/progress/line.png`} alt="" className="w-full h-full object-fill" draggable={false} />
        </div>
        {/* 進度線 */}
        <div
          className="absolute left-4 bottom-[5px] md:bottom-[6px] h-[2px] rounded-full transition-all duration-500"
          style={{
            width: `calc(${progress}% * (100% - 32px) / 100)`,
            background: 'linear-gradient(90deg, #c5a059, #6ba3b5)',
          }}
        />

        {/* 角色氣泡 — 進度條下方，跟隨角色位置 */}
        {isTalking && (() => {
          const charPct = (current / 6) * 100;
          // 氣泡寬度約 60%，根據角色位置決定氣泡偏移，保持尾巴對齊角色
          // 角色在左邊 → 氣泡偏右，角色在右邊 → 氣泡偏左
          const bubbleW = 60; // 氣泡佔父容器寬度 %
          const tailInBubble = Math.max(15, Math.min(85, charPct)); // 尾巴在氣泡內的位置 %
          // 氣泡 left = 角色位置 - 尾巴在氣泡中的偏移
          const bubbleLeft = Math.max(0, Math.min(100 - bubbleW, charPct - (bubbleW * tailInBubble / 100)));

          return (
            <AnimatePresence mode="wait">
              <motion.div
                key={idleLine}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="absolute left-0 right-0 z-30"
                style={bubbleAbove
                  ? { bottom: '100%', marginBottom: '6px' }
                  : { top: '100%', marginTop: '6px' }
                }
              >
                {/* 尾巴 — 雙三角形（外邊框 + 內填充）一體感 */}
                {bubbleAbove ? (
                  <>
                    <div className="absolute z-10" style={{ left: `${charPct}%`, bottom: '-11px', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '12px solid #2a2a2a' }} />
                    <div className="absolute z-10" style={{ left: `${charPct}%`, bottom: '-8px', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid white' }} />
                  </>
                ) : (
                  <>
                    <div className="absolute z-10" style={{ left: `${charPct}%`, top: '-11px', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '12px solid #2a2a2a' }} />
                    <div className="absolute z-10" style={{ left: `${charPct}%`, top: '-8px', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '10px solid white' }} />
                  </>
                )}
                {/* 對話框 */}
                <div
                  className="absolute rounded-2xl border-2 border-[#2a2a2a] bg-white px-4 py-2 shadow-md"
                  style={{
                    left: `${bubbleLeft}%`,
                    width: `${bubbleW}%`,
                    fontFamily: QUIZ_FONT,
                  }}
                >
                  <p className="text-[0.75rem] md:text-[0.85rem] text-[#2a2a2a] leading-snug text-center">
                    {idleLine}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          );
        })()}

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
                  ...(isCurrent && isTalking ? { rotate: [0, -8, 8, -5, 5, 0] } : { rotate: 0 }),
                }}
                transition={isCurrent && isTalking
                  ? { rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }, scale: { type: 'spring', stiffness: 300, damping: 20 } }
                  : { type: 'spring', stiffness: 300, damping: 20 }
                }
              >
                <img
                  src={`${BASE}/progress/char-${i + 1}.png`}
                  alt={name}
                  className="w-6 h-6 md:w-7 md:h-7 object-contain"
                  draggable={false}
                />
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
              <motion.img
                src={`${BASE}/progress/${isCurrent || isPast ? 'dot-on' : 'dot-off'}.png`}
                alt=""
                className="w-2.5 h-2.5 md:w-3 md:h-3 mt-1 object-contain"
                draggable={false}
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
    const min = new Promise((r) => setTimeout(r, 2000));
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
  question, currentQ, isFirstQ, tapped,
  onSelect, onPrev,
}: {
  question: typeof questions[0]; currentQ: number; isFirstQ: boolean;
  tapped: number | null; onSelect: (i: number) => void; onPrev: () => void;
}) {
  const idleLine = useIdleLine(currentQ);

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
      <div className="flex-1 min-h-[40px] md:min-h-0 md:flex-none md:h-[20%]" />

      {/* 內容區 — 電腦版置中 */}
      <div className="px-5 md:px-0 md:mx-auto md:w-[40%] md:max-w-[480px]">
        {/* 手機版：進度條在 Q 上方，氣泡在進度條上方（留白區） */}
        <div className="md:hidden mb-1.5 pt-12">
          <ProgressBar current={currentQ} idleLine={idleLine} bubbleAbove />
        </div>

        {/* Q 號碼 */}
        <motion.span
          className="text-[1.8rem] md:text-[2.8rem] leading-none block mb-0.5"
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
          className="text-[1.05rem] md:text-[1.5rem] leading-snug mb-2.5 md:mb-4"
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
        <div className="flex flex-col gap-1.5 md:gap-3">
          {question.options.map((opt, i) => (
            <QuizOption key={`${currentQ}-${i}`} label={opt} onClick={() => onSelect(i)} delay={0.05 + i * 0.06} active={tapped === i} />
          ))}
        </div>

        {/* 電腦版：進度條在選項下方，氣泡在進度條下方 */}
        <div className="hidden md:block mt-6 pb-12">
          <ProgressBar current={currentQ} idleLine={idleLine} />
        </div>
      </div>

      {/* 底部彈性空間 */}
      <div className="flex-1 min-h-[16px] md:flex-1" />
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

  const playBgm = () => {
    if (!bgmRef.current) {
      const audio = new Audio('/audio/quiz-bg.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      bgmRef.current = audio;
    }
    bgmRef.current.play().catch(() => {});
  };

  const handleStart = () => {
    playBgm();
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
          : 'relative w-full h-dvh overflow-hidden'
        }
        style={isDesktop
          ? { height: 'min(100dvh, calc(100vw * 9 / 16))', maxWidth: 'calc(100dvh * 16 / 9)' }
          : {}
        }
      >
        <AnimatePresence>
          {phase === 'cover' && <CoverPage onStart={handleStart} isDesktop={isDesktop} />}
          {phase === 'loading' && <LoadingScreen onDone={() => setPhase('quiz')} isDesktop={isDesktop} />}
        </AnimatePresence>

        {phase === 'quiz' && (
          <>
            {/* 底層背景 — 防止切換時露出黑底 */}
            <img src={isDesktop ? question.bgWide : question.bg} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            <AnimatePresence>
              <motion.div key={currentQ} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                <img src={isDesktop ? question.bgWide : question.bg} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                <QuestionView question={question} currentQ={currentQ} isFirstQ={isFirstQ} tapped={tapped} onSelect={handleSelect} onPrev={handlePrev} />
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
