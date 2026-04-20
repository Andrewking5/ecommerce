import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEventGate } from '../hooks/useEventGate';

/* ──────────────────────────────────────
   Soul Guitar — 心理測驗
   純背景 + 標題圖片分離，完整 RWD
   手機 9:16 / 電腦 16:9
   ────────────────────────────────────── */

const BASE = '/images/events/quiz';
const CACHE_V = `?v=${__ASSET_V__}`; // auto-generated at build time — no manual bumping needed
const QUIZ_FONT = '"Glow Sans TC", "Noto Sans TC", sans-serif';

const V = CACHE_V;
const questions = [
  { id: 1, bg: `${BASE}/q1.webp${V}`, bgWide: `${BASE}/q1-wide.webp${V}`, questionText: '如果今天突然有一整天的空閒，你最想？', options: ['找一家舒服的小店坐著，慢慢待一下午', '不特別安排路線，直接出門走走看看', '待在房間裡聽歌發呆，讓思緒慢慢飄遠', '約朋友出去，讓今天過得熱鬧一點'] },
  { id: 2, bg: `${BASE}/q2.webp${V}`, bgWide: `${BASE}/q2-wide.webp${V}`, questionText: '如果有一首歌讓你反覆聽很多次，通常是因為？', options: ['它很溫暖，會讓你想到一些人或一些時刻', '它有種流動感，像把你帶去別的地方', '它裡面有一種很深的情緒，會讓你一直停留', '它很有個性，像有人把真實的自己直接唱了出來'] },
  { id: 3, bg: `${BASE}/q3.webp${V}`, bgWide: `${BASE}/q3-wide.webp${V}`, questionText: '如果要去聽一場現場音樂，你比較想去？', options: ['小咖啡店 acoustic 演出，可以一邊喝飲料一邊慢慢聽歌', '戶外音樂表演，邊走邊聽也很自在', '深夜的小酒吧，安靜坐著聽完整場演出', 'Live House 現場演出，越有氣氛越吸引你'] },
  { id: 4, bg: `${BASE}/q4.webp${V}`, bgWide: `${BASE}/q4-wide.webp${V}`, questionText: '如果你的生活是一種風景，它比較像？', options: ['和喜歡的人在熟悉的街區散步，節奏慢慢的', '海風裡的海岸線，走著走著就像想起很多畫面', '夜晚的窗邊，安靜但心裡有很多沒說完的感受', '燈光很亮、人聲很多、情緒也很滿的城市夜裡'] },
  { id: 5, bg: `${BASE}/q5.webp${V}`, bgWide: `${BASE}/q5-wide.webp${V}`, questionText: '當你聽音樂時，你比較常？', options: ['覺得自己被輕輕接住，心情慢慢變得柔軟', '開始想像很多畫面，像腦海裡慢慢展開一段風景', '像掉進自己的想像世界裡，暫時離開眼前的一切', '很想跟著節奏動起來，或立刻把感覺表現出來'] },
  { id: 6, bg: `${BASE}/q6.webp${V}`, bgWide: `${BASE}/q6-wide.webp${V}`, questionText: '朋友們通常在什麼樣的場合最容易想到你？', options: ['想找人安靜聊聊、被溫柔接住的時候', '突然想出門走走、換個地方透透氣的時候', '有些情緒說不太清楚，想找一個會懂那種感覺的人時', '有靈感、有衝動，想立刻找人一起做點什麼的時候'] },
  { id: 7, bg: `${BASE}/q7.webp${V}`, bgWide: `${BASE}/q7-wide.webp${V}`, questionText: '如果你走在街上突然聽到有人彈吉他，你通常會？', options: ['停下來聽一下，讓那段旋律陪你一下', '邊走邊聽，覺得整條街都變得很有感覺', '站遠一點靜靜聽，像被那段聲音帶進另一個世界', '忍不住走近一點，想看他怎麼把情緒變成表演'] },
];

const CHARACTER_NAMES = ['火焰', '太陽', '煙火', '微光', '海浪', '深海', '月光'];

/* ── 角色閒聊台詞（3 秒沒選就出現） ── */
const CHARACTER_LINES: string[][] = [
  // Q1 — 火焰：熱情衝動
  [
    '欸欸快選啦！想太久火都要滅了🔥',
    '哪有人放假還在猶豫的啦！',
    '直覺直覺！不要想太多！',
    '我已經等到快燒起來了⋯',
    '選錯又不會怎樣，衝就對了！',
    '像刷和弦一樣，手動了答案就出來了🎸',
    '放假欸！開心的事不用想那麼久啦',
    '再不選我就自己幫你刷一段了喔～',
  ],
  // Q2 — 太陽：溫暖陽光
  [
    '慢慢來沒關係～但我快曬到融化了☀️',
    '每首歌都有它的故事呢～',
    '想一下也好，音樂值得被認真對待',
    '選哪個都很棒的！相信自己～',
    '你一定有那首聽到會微笑的歌吧？',
    '閉上眼睛，哪個旋律先浮出來？',
    '好的吉他聲就像陽光，暖暖的🎶',
    '有些和弦一聽就覺得被治癒了呢',
  ],
  // Q3 — 煙火：華麗短暫
  [
    '快點快點！精彩的瞬間不等人的✨',
    '哇這題好難選！但煙火不能等太久～',
    '想像一下那個畫面，答案就出來了！',
    '別猶豫！最閃亮的選擇就是現在！',
    '舞台上的吉他手可不會猶豫！',
    '你想當台上的人還是台下的人？',
    '煙火的哲學：先彈再說！🎸',
    '音樂現場最棒的就是那種心跳感！',
  ],
  // Q4 — 微光：安靜溫柔
  [
    '沒關係，慢慢想⋯我會在這裡等你🕯️',
    '每個風景都很美，就像你一樣',
    '靜靜感受一下，答案會自己浮現的',
    '不急不急，微光最懂等待的美',
    '你心裡一定有一個最安靜的角落',
    '深呼吸⋯感覺到了嗎？',
    '一把好吉他，輕輕撥就能感動人',
    '有時候最小的聲音，傳得最遠🎵',
  ],
  // Q5 — 海浪：自由奔放
  [
    '跟著感覺走就對了🌊～',
    '音樂就像海浪，讓它帶著你吧',
    '想太多就不自由了喔！',
    '隨波逐流也是一種答案啦～',
    '聽音樂幹嘛分析！享受就好啊',
    '浪來了就衝，別站在岸上看！',
    '在海邊彈吉他，那才叫自由🎸',
    '每個浪都不一樣，就像每次即興',
  ],
  // Q6 — 深海：神秘深沉
  [
    '⋯⋯（在深海裡安靜地等你）🫧',
    '有些答案藏在最深的地方',
    '不用急，深海的時間流動得很慢',
    '潛入內心深處，你會找到答案的',
    '⋯⋯（冒了一個泡泡）',
    '最深沉的琴聲，只有安靜才聽得見',
    '你是不是也喜歡一個人安靜彈琴？🎶',
    '最好的低音，藏在最深的共鳴裡',
  ],
  // Q7 — 月光：浪漫感性
  [
    '月光不催人，但夜不會永遠等你🌙',
    '這是最後一題了，好好感受吧',
    '街頭的吉他聲⋯你聽見了嗎？',
    '用心去選，這會成為你的靈魂記憶',
    '最後的選擇，往往最接近真實的你',
    '月光下彈吉他，每個音都特別誠實',
    '這首歌快結束了⋯你準備好了嗎？🎸',
    '把這個旋律留在心裡，然後選吧',
  ],
];

/* ── 計分邏輯（依 PDF 設計） ── */
type Soul = 'SUN' | 'WAVE' | 'MOON' | 'FIRE';
type Dim = '自由' | '故事';

// 每題 4 選項 → [Soul, Dimension]
// Q4-A 是 SUN+自由，其餘 A 都是 SUN+故事
const SCORING: [Soul, Dim][][] = [
  /* Q1 */ [['SUN', '故事'], ['WAVE', '自由'], ['MOON', '自由'], ['FIRE', '自由']],
  /* Q2 */ [['SUN', '故事'], ['WAVE', '自由'], ['MOON', '故事'], ['FIRE', '故事']],
  /* Q3 */ [['SUN', '自由'], ['WAVE', '自由'], ['MOON', '故事'], ['FIRE', '自由']],
  /* Q4 */ [['SUN', '自由'], ['WAVE', '故事'], ['MOON', '故事'], ['FIRE', '自由']],
  /* Q5 */ [['SUN', '故事'], ['WAVE', '故事'], ['MOON', '自由'], ['FIRE', '自由']],
  /* Q6 */ [['SUN', '故事'], ['WAVE', '自由'], ['MOON', '故事'], ['FIRE', '故事']],
  /* Q7 */ [['SUN', '自由'], ['WAVE', '故事'], ['MOON', '自由'], ['FIRE', '故事']],
];

function calculateResult(ans: number[]): string {
  const soul: Record<Soul, number> = { SUN: 0, WAVE: 0, MOON: 0, FIRE: 0 };
  const dim: Record<Dim, number> = { '自由': 0, '故事': 0 };
  const lastQ: Record<Soul, number> = { SUN: -1, WAVE: -1, MOON: -1, FIRE: -1 };

  ans.forEach((a, q) => {
    const [s, d] = SCORING[q][a];
    soul[s]++;
    dim[d]++;
    lastQ[s] = q;
  });

  // Step 1: 最高 soul
  const maxS = Math.max(...Object.values(soul));
  const tops = (Object.keys(soul) as Soul[]).filter(s => soul[s] === maxS);
  // Step 2: 平手 → 最後出現的贏
  const mainSoul = tops.length === 1
    ? tops[0]
    : tops.reduce((a, b) => (lastQ[a] > lastQ[b] ? a : b));

  // Step 3: 自由 vs 故事
  let dimension: Dim;
  if (dim['自由'] !== dim['故事']) {
    dimension = dim['自由'] > dim['故事'] ? '自由' : '故事';
  } else {
    // Step 4: 平手 → 看 Q6（index 5）
    dimension = SCORING[5][ans[5]][1];
  }

  return `${mainSoul}_${dimension}`;
}

/* ── 結果 URL slug 映射（直譯） ── */
const RESULT_SLUG: Record<string, string> = {
  'FIRE_自由': 'fire',
  'FIRE_故事': 'fireworks',
  'SUN_自由':  'sun',
  'SUN_故事':  'glow',
  'WAVE_自由': 'wave',
  'WAVE_故事': 'deep-sea',
  'MOON_故事': 'moon',
  'MOON_自由': 'dream-moon',
};

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
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idxRef = useRef(0);

  useEffect(() => {
    setLineIdx(-1);
    idxRef.current = 0;

    const showNext = () => {
      setLineIdx(idxRef.current);
      // 4~6 秒後消失
      const hideDelay = 4000 + Math.random() * 2000;
      hideRef.current = setTimeout(() => {
        setLineIdx(-1);
        // 消失後 6~10 秒再出現下一句
        const nextDelay = 6000 + Math.random() * 4000;
        nextRef.current = setTimeout(() => {
          idxRef.current = (idxRef.current + 1) % CHARACTER_LINES[currentQ].length;
          showNext();
        }, nextDelay);
      }, hideDelay);
    };

    // 3 秒後顯示第一句
    timerRef.current = setTimeout(showNext, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
      if (nextRef.current) clearTimeout(nextRef.current);
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

        {/* 角色對話框 — 跟隨角色位置，不擋進度條 */}
        {isTalking && (() => {
          const charPct = (current / 6) * 100;
          const bubbleW = 55;
          const bubbleLeft = Math.max(2, Math.min(100 - bubbleW - 2, charPct - bubbleW / 2));

          return (
            <AnimatePresence mode="wait">
              <motion.div
                key={idleLine}
                initial={{ opacity: 0, y: bubbleAbove ? 4 : -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: bubbleAbove ? 4 : -4 }}
                transition={{ duration: 0.25 }}
                className="absolute left-0 right-0 z-30"
                style={bubbleAbove
                  ? { bottom: '100%', marginBottom: '58px' }
                  : { top: '100%', marginTop: '8px' }
                }
              >
                <div
                  className="absolute rounded-2xl border-2 border-[#2a2a2a] bg-white px-4 py-2 shadow-md"
                  style={{ left: `${bubbleLeft}%`, width: `${bubbleW}%`, fontFamily: QUIZ_FONT }}
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
    const min = new Promise((r) => setTimeout(r, 5000));
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
      <img src={`${BASE}/loading.webp`} alt="載入中" className="w-40 h-40 object-contain" draggable={false} />
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
    <motion.div className="absolute inset-0 z-50 overflow-hidden cursor-pointer" onClick={onStart} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
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
        <img src={`${BASE}/cover-start-btn.png${V}`} alt="解鎖你的吉他靈魂檔案" className="w-full h-auto" draggable={false} />
      </motion.button>
      <div className="absolute z-10 bottom-0 left-0 right-0 h-9 overflow-hidden" style={{ background: 'linear-gradient(90deg, #c5a059 0%, #a0a068 35%, #6a9a8a 65%, #4a7a8a 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="flex items-center h-full w-[200%]" style={{ animation: 'marquee 15s linear infinite' }}>
            <div className="flex items-center justify-around w-1/2"><img src={`${BASE}/cover-marquee.png${V}`} alt="" className="h-4.5 w-auto" draggable={false} /></div>
            <div className="flex items-center justify-around w-1/2"><img src={`${BASE}/cover-marquee.png${V}`} alt="" className="h-4.5 w-auto" draggable={false} /></div>
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

      {/* 手機版：進度條固定在畫面頂部 */}
      <div className="md:hidden absolute top-[148px] left-5 right-5 z-20">
        <ProgressBar current={currentQ} idleLine={idleLine} bubbleAbove />
      </div>

      {/* 上半留白 */}
      <div className="flex-1 min-h-[40px] md:min-h-0 md:flex-none md:h-[20%]" />

      {/* 內容區 — 電腦版置中 */}
      <div className="px-5 md:px-0 md:mx-auto md:w-[40%] md:max-w-[480px]">

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
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'cover' | 'loading' | 'quiz'>('cover');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [tapped, setTapped] = useState<number | null>(null);
  const { checking, blocked } = useEventGate('soul-guitar');
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const question = questions[currentQ];
  const isFirstQ = currentQ === 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
        bgmRef.current = null;
      }
    };
  }, []);

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
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        // 最後一題 → 計算結果 → 跳轉結果頁
        const key = calculateResult(a);
        sessionStorage.setItem('soulGuitar_fromQuiz', '1');
        navigate(`/e/soul-guitar/${RESULT_SLUG[key] ?? 'fire'}`);
      }
    }, 500);
  };

  const handlePrev = () => { if (currentQ > 0) setCurrentQ(currentQ - 1); };

  const currentBg = phase === 'quiz' ? (isDesktop ? question.bgWide : question.bg) : `${BASE}/cover-bg.webp`;

  if (checking) return null;

  if (blocked) return (
    <div className="w-full min-h-dvh flex flex-col items-center justify-center bg-black gap-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold">測試模式</p>
      <p className="text-white/40 text-sm">此頁面尚未對外開放，僅限管理員預覽。</p>
    </div>
  );

  return (
    <div className="w-full min-h-dvh flex items-center justify-center relative overflow-hidden bg-black">
      {/* 模糊背景 — IG Story（手機版兩側） */}
      {!isDesktop && (
        <div className="absolute inset-0 bg-cover bg-center blur-lg scale-105 brightness-[0.35]" style={{ backgroundImage: `url(${currentBg})` }} />
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
