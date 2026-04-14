import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

/* ──────────────────────────────────────
   Soul Guitar — 心理測驗（響應式版本）
   手機：9:16 直式卡片
   電腦：16:9 橫式全寬
   ────────────────────────────────────── */

const BASE = '/images/events/quiz';
const QUIZ_FONT = '"Glow Sans TC", "Noto Sans TC", sans-serif';

/** 7 題題目資料（手機 + 電腦背景） */
const questions = [
  { id: 1, bg: `${BASE}/q1.webp`, bgWide: `${BASE}/q1-wide.webp`, options: ['找一家舒服的小店坐著放鬆', '隨便出門走走看看城市', '待在房間聽歌或想事情', '找朋友出去玩熱鬧一下'] },
  { id: 2, bg: `${BASE}/q2.webp`, bgWide: `${BASE}/q2-wide.webp`, options: ['旋律很溫暖很好聽', '整體感覺很自由很流動', '歌詞或氛圍很有情緒', '節奏很強讓人很想跳舞'] },
  { id: 3, bg: `${BASE}/q3.webp`, bgWide: `${BASE}/q3-wide.webp`, options: ['小咖啡店 acoustic 演出', '戶外音樂表演', '深夜小酒吧', 'Live House 現場演出'] },
  { id: 4, bg: `${BASE}/q4.webp`, bgWide: `${BASE}/q4-wide.webp`, options: ['和朋友在咖啡店聊天的午後', '海邊吹著風的海岸', '月光下安靜的夜晚', '充滿歡聲笑語居酒屋之夜'] },
  { id: 5, bg: `${BASE}/q5.webp`, bgWide: `${BASE}/q5-wide.webp`, options: ['覺得心情變得很舒服', '開始想像很多畫面', '想到很多回憶', '跟著節奏點頭或動起來'] },
  { id: 6, bg: `${BASE}/q6.webp`, bgWide: `${BASE}/q6-wide.webp`, options: ['需要有人陪著聊天、\n分享心事的時候', '突然想出門、\n說走就走的時候', '當想一個人靜靜待著、\n但又不想完全孤單的時候', '需要有人把氣氛炒熱、\n帶動大家的時候'] },
  { id: 7, bg: `${BASE}/q7.webp`, bgWide: `${BASE}/q7-wide.webp`, options: ['停下來聽一下，\n看看是不是熟悉的旋律', '邊走邊聽，\n覺得街道變得很有感覺', '站遠一點靜靜聽完整首，\n能低調就低調', '忍不住走近一點，想看\n清楚表演者演出當下的樣子'] },
];

const CHARACTER_NAMES = ['火焰', '太陽', '煙火', '微光', '海浪', '深海', '月光'];

/** 偵測是否為桌面版（>768px） */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

/* ──────────────────────────────────────
   按鈕元件
   ────────────────────────────────────── */
function QuizOption({ label, onClick, delay, active }: { label: string; onClick: () => void; delay: number; active: boolean }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="w-full cursor-pointer group relative"
    >
      <img src={`${BASE}/btn-default.png`} alt="" className={`w-full h-auto transition-opacity duration-200 ${active ? 'opacity-0' : 'group-hover:opacity-0'}`} draggable={false} />
      <img src={`${BASE}/btn-selected.png`} alt="" className={`absolute inset-0 w-full h-auto transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} draggable={false} />
      <span className={`absolute inset-0 flex items-center justify-center text-[0.95rem] leading-snug transition-colors duration-200 whitespace-pre-line text-center px-4 ${active ? 'text-white' : 'text-[#2a2a2a] group-hover:text-white'}`} style={{ fontFamily: QUIZ_FONT }}>{label}</span>
    </motion.button>
  );
}

/* ──────────────────────────────────────
   進度條
   ────────────────────────────────────── */
function ProgressBar({ current }: { current: number }) {
  return (
    <div className="w-full px-4 py-3">
      <div className="relative flex items-center justify-between max-w-[320px] mx-auto">
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px]">
          <img src={`${BASE}/progress/line.png`} alt="" className="w-full h-full object-fill" draggable={false} />
        </div>
        {CHARACTER_NAMES.map((name, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center">
            <motion.div animate={{ opacity: i <= current ? 1 : 0.3 }} transition={{ duration: 0.4 }}>
              <img src={`${BASE}/progress/char-${i + 1}.png`} alt={name} className="w-8 h-8 object-contain" draggable={false} />
            </motion.div>
            <img src={`${BASE}/progress/${i <= current ? 'dot-on' : 'dot-off'}.png`} alt="" className="w-2.5 h-2.5 mt-0.5" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────
   Loading
   ────────────────────────────────────── */
function LoadingScreen({ onDone, isDesktop }: { onDone: () => void; isDesktop: boolean }) {
  useEffect(() => {
    const minDelay = new Promise((r) => setTimeout(r, 1500));
    const allImages = questions.map(
      (q) => new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = isDesktop ? q.bgWide : q.bg;
      }),
    );
    const btnImages = ['/btn-default.png', '/btn-selected.png'].map(
      (f) => new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = `${BASE}${f}`;
      }),
    );
    Promise.all([minDelay, ...allImages, ...btnImages]).then(onDone);
  }, [onDone, isDesktop]);

  return (
    <motion.div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0e8]" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <motion.img src={`${BASE}/loading.png`} alt="載入中" className="w-40 h-40 object-contain" animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} draggable={false} />
      <motion.p className="mt-6 text-[#2a2a2a]/60 text-sm tracking-widest" style={{ fontFamily: QUIZ_FONT }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>正在為你準備測驗⋯</motion.p>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   封面
   ────────────────────────────────────── */
function CoverPage({ onStart, isDesktop }: { onStart: () => void; isDesktop: boolean }) {
  useEffect(() => {
    questions.forEach((q) => {
      const img = new Image();
      img.src = isDesktop ? q.bgWide : q.bg;
    });
    ['/btn-default.png', '/btn-selected.png'].forEach((f) => {
      const img = new Image();
      img.src = `${BASE}${f}`;
    });
  }, [isDesktop]);

  return (
    <motion.div className="absolute inset-0 z-50 overflow-hidden" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      {/* 封面背景 — 手機用影片，電腦用 16:9 圖 */}
      {isDesktop ? (
        <img src={`${BASE}/cover-bg-wide.webp`} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      ) : (
        <video className="absolute inset-0 w-full h-full object-cover" src="/videos/soul-guitar-cover.mp4" autoPlay loop muted playsInline />
      )}

      {/* 開始按鈕 */}
      <motion.button
        type="button"
        onClick={onStart}
        className="absolute z-10 left-1/2 -translate-x-1/2 bottom-[12%] w-[50%] max-w-[260px] active:scale-95 transition-transform md:w-[20%] md:max-w-[300px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, filter: ['drop-shadow(0 0 0px rgba(218,165,50,0.2))', 'drop-shadow(0 0 14px rgba(218,165,50,0.7))', 'drop-shadow(0 0 0px rgba(218,165,50,0.2))'] }}
        transition={{ opacity: { duration: 0.6, delay: 0.5 }, y: { duration: 0.6, delay: 0.5 }, filter: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
        whileTap={{ scale: 0.95 }}
      >
        <img src={`${BASE}/cover-start-btn.png`} alt="解鎖你的吉他靈魂檔案" className="w-full h-auto" draggable={false} />
      </motion.button>

      {/* 跑馬燈 */}
      <div className="absolute z-10 bottom-0 left-0 right-0 h-9 overflow-hidden" style={{ background: 'linear-gradient(90deg, #c5a059 0%, #a0a068 35%, #6a9a8a 65%, #4a7a8a 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="flex items-center h-full w-[200%]" style={{ animation: 'marquee 15s linear infinite' }}>
            <div className="flex items-center justify-around w-1/2">
              <img src={`${BASE}/cover-marquee.png`} alt="" className="h-4.5 w-auto" draggable={false} />
            </div>
            <div className="flex items-center justify-around w-1/2">
              <img src={`${BASE}/cover-marquee.png`} alt="" className="h-4.5 w-auto" draggable={false} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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
  const handleLoadingDone = () => setPhase('quiz');

  const handleSelect = (optionIndex: number) => {
    if (tapped !== null) return;
    setTapped(optionIndex);
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
    setTimeout(() => {
      setTapped(null);
      if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
    }, 500);
  };

  const handlePrev = () => { if (currentQ > 0) setCurrentQ(currentQ - 1); };

  const fadeVariants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

  // 目前背景（用於手機模糊背景）
  const currentBg = phase === 'quiz' ? question.bg : `${BASE}/cover-bg.webp`;

  return (
    <div className="w-full min-h-dvh flex items-center justify-center relative overflow-hidden">
      {/* ===== 手機版：9:16 卡片 + 模糊背景 ===== */}
      {!isDesktop && (
        <>
          {/* 模糊背景 */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-lg scale-105 brightness-[0.35] transition-all duration-500"
            style={{ backgroundImage: `url(${currentBg})` }}
          />
          {/* 9:16 卡片 */}
          <div className="relative h-dvh mx-auto overflow-hidden" style={{ width: 'min(100vw, calc(100dvh * 9 / 16))' }}>
            <AnimatePresence>
              {phase === 'cover' && <CoverPage onStart={handleStart} isDesktop={false} />}
              {phase === 'loading' && <LoadingScreen onDone={handleLoadingDone} isDesktop={false} />}
            </AnimatePresence>

            {phase === 'quiz' && (
              <div className="flex flex-col h-full">
                <div className="relative flex-1 overflow-hidden">
                  <AnimatePresence>
                    <motion.div key={currentQ} variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0">
                      <img src={question.bg} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                      <div className="relative z-10 flex flex-col h-full">
                        {!isFirstQ && (
                          <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handlePrev} className="absolute top-4 left-4 z-20 flex items-center gap-0.5 rounded-full bg-white/40 backdrop-blur-sm pl-1 pr-2.5 py-1 text-[#2a2a2a]/70 hover:bg-white/60 hover:text-[#2a2a2a] transition-all">
                            <ChevronLeft size={14} />
                            <span className="text-[10px]" style={{ fontFamily: QUIZ_FONT }}>上一題</span>
                          </motion.button>
                        )}
                        <div className="absolute z-20" style={{ top: 'calc(27.5% - 14px)', left: 'calc(22% + 3px)', right: '4%' }}>
                          <ProgressBar current={currentQ} />
                        </div>
                        <div className="flex-none" style={{ height: '50%' }} />
                        <div className="flex-1 flex flex-col justify-start px-5 gap-2">
                          {question.options.map((opt, i) => (
                            <QuizOption key={`${currentQ}-${i}`} label={opt} onClick={() => handleSelect(i)} delay={0.05 + i * 0.06} active={tapped === i} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== 電腦版：16:9 全寬，容器鎖定 16:9 比例 ===== */}
      {isDesktop && (
        <div className="relative w-full overflow-hidden" style={{ height: 'min(100dvh, calc(100vw * 9 / 16))', maxWidth: 'calc(100dvh * 16 / 9)' }}>
          <AnimatePresence>
            {phase === 'cover' && <CoverPage onStart={handleStart} isDesktop />}
            {phase === 'loading' && <LoadingScreen onDone={handleLoadingDone} isDesktop />}
          </AnimatePresence>

          {phase === 'quiz' && (
            <div className="relative w-full h-full">
              <AnimatePresence>
                <motion.div key={currentQ} variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0">
                  {/* 16:9 背景 */}
                  <img src={question.bgWide} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

                  <div className="relative z-10 flex flex-col h-full">
                    {/* 上一題 */}
                    {!isFirstQ && (
                      <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handlePrev} className="absolute top-6 left-6 z-20 flex items-center gap-1 rounded-full bg-white/40 backdrop-blur-sm pl-2 pr-3.5 py-1.5 text-[#2a2a2a]/70 hover:bg-white/60 hover:text-[#2a2a2a] transition-all">
                        <ChevronLeft size={16} />
                        <span className="text-xs" style={{ fontFamily: QUIZ_FONT }}>上一題</span>
                      </motion.button>
                    )}

                    {/* 進度條 — Q 文字旁邊（跟手機版一樣） */}
                    <div className="absolute z-20" style={{ top: 'calc(27% - 14px)', left: '18%', right: '30%' }}>
                      <ProgressBar current={currentQ} />
                    </div>

                    {/* 上半留白 — 讓出 Q 文字區域 */}
                    <div className="flex-1" />

                    {/* 選項按鈕 */}
                    <div className="w-full flex flex-col items-center pb-14">
                      {/* 選項按鈕 */}
                      <div className="w-full max-w-[420px] flex flex-col gap-2.5 px-4">
                        {question.options.map((opt, i) => (
                          <QuizOption key={`${currentQ}-${i}`} label={opt} onClick={() => handleSelect(i)} delay={0.05 + i * 0.06} active={tapped === i} />
                        ))}
                      </div>
                    </div>

                    {/* 跑馬燈 — 疊在背景底部 */}
                    <div className="absolute bottom-0 left-0 right-0 h-9 overflow-hidden z-20" style={{ background: 'linear-gradient(90deg, #c5a059 0%, #a0a068 35%, #6a9a8a 65%, #4a7a8a 100%)' }}>
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="flex items-center h-full w-[200%]" style={{ animation: 'marquee 15s linear infinite' }}>
                          <div className="flex items-center justify-around w-1/2"><img src={`${BASE}/cover-marquee.png`} alt="" className="h-4.5 w-auto" draggable={false} /></div>
                          <div className="flex items-center justify-around w-1/2"><img src={`${BASE}/cover-marquee.png`} alt="" className="h-4.5 w-auto" draggable={false} /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
