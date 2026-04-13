import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

/* ──────────────────────────────────────
   Soul Guitar — 心理測驗（7 題完整版）
   ────────────────────────────────────── */

const BASE = '/images/events/quiz';
const QUIZ_FONT = '"Glow Sans TC", "Noto Sans TC", sans-serif';
const WALL_COLOR = '#6ba3b5';

/** 7 題題目資料 */
const questions = [
  {
    id: 1,
    bg: `${BASE}/q1.jpg`,
    options: [
      '找一家舒服的小店坐著放鬆',
      '隨便出門走走看看城市',
      '待在房間聽歌或想事情',
      '找朋友出去玩熱鬧一下',
    ],
  },
  {
    id: 2,
    bg: `${BASE}/q2.jpg`,
    options: [
      '旋律很溫暖很好聽',
      '整體感覺很自由很流動',
      '歌詞或氛圍很有情緒',
      '節奏很強讓人很想跳舞',
    ],
  },
  {
    id: 3,
    bg: `${BASE}/q3.jpg`,
    options: [
      '小咖啡店 acoustic 演出',
      '戶外音樂表演',
      '深夜小酒吧',
      'Live House 現場演出',
    ],
  },
  {
    id: 4,
    bg: `${BASE}/q4.jpg`,
    options: [
      '和朋友在咖啡店聊天的午後',
      '海邊吹著風的海岸',
      '月光下安靜的夜晚',
      '充滿歡聲笑語居酒屋之夜',
    ],
  },
  {
    id: 5,
    bg: `${BASE}/q5.jpg`,
    options: [
      '覺得心情變得很舒服',
      '開始想像很多畫面',
      '想到很多回憶',
      '跟著節奏點頭或動起來',
    ],
  },
  {
    id: 6,
    bg: `${BASE}/q6.jpg`,
    options: [
      '需要有人陪著聊天、\n分享心事的時候',
      '突然想出門、\n說走就走的時候',
      '當想一個人靜靜待著、\n但又不想完全孤單的時候',
      '需要有人把氣氛炒熱、\n帶動大家的時候',
    ],
  },
  {
    id: 7,
    bg: `${BASE}/q7.jpg`,
    options: [
      '停下來聽一下，\n看看是不是熟悉的旋律',
      '邊走邊聽，\n覺得街道變得很有感覺',
      '站遠一點靜靜聽完整首，\n能低調就低調',
      '忍不住走近一點，想看\n清楚表演者演出當下的樣子',
    ],
  },
];

/** 進度條角色名稱 */
const CHARACTER_NAMES = ['火焰', '太陽', '煙火', '微光', '海浪', '深海', '月光'];

/* ──────────────────────────────────────
   圖片按鈕元件
   用空白按鈕圖片 + HTML 文字疊合
   hover → 灰底白字
   ────────────────────────────────────── */
function QuizOption({
  label,
  onClick,
  delay,
}: {
  label: string;
  onClick: () => void;
  delay: number;
}) {
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
      {/* 預設：漸層邊框按鈕圖片 */}
      <img
        src={`${BASE}/btn-default.png`}
        alt=""
        className="w-full h-auto transition-opacity duration-200 group-hover:opacity-0"
        draggable={false}
      />
      {/* Hover：灰底按鈕圖片 */}
      <img
        src={`${BASE}/btn-selected.png`}
        alt=""
        className="absolute inset-0 w-full h-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        draggable={false}
      />
      {/* 文字疊在按鈕上 */}
      <span
        className="absolute inset-0 flex items-center justify-center text-[0.95rem] leading-snug text-[#2a2a2a] transition-colors duration-200 group-hover:text-white whitespace-pre-line text-center px-4"
        style={{ fontFamily: QUIZ_FONT }}
      >
        {label}
      </span>
    </motion.button>
  );
}

/* ──────────────────────────────────────
   進度條元件
   線 + 7 個角色（未到達半透明）
   ────────────────────────────────────── */
function ProgressBar({ current }: { current: number }) {
  return (
    <div className="w-full px-4 py-3">
      <div className="relative flex items-center justify-between max-w-[320px] mx-auto">
        {/* 底線 */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px]">
          <img
            src={`${BASE}/progress/line.png`}
            alt=""
            className="w-full h-full object-fill"
            draggable={false}
          />
        </div>

        {/* 7 個角色 */}
        {CHARACTER_NAMES.map((name, i) => {
          const isReached = i <= current;
          return (
            <div
              key={i}
              className="relative z-10 flex flex-col items-center"
            >
              {/* 角色圖示 */}
              <motion.div
                className="relative"
                animate={{ opacity: isReached ? 1 : 0.3 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={`${BASE}/progress/char-${i + 1}.png`}
                  alt={name}
                  className="w-8 h-8 object-contain"
                  draggable={false}
                />
              </motion.div>
              {/* 圓點（發光 vs 未發光） */}
              <img
                src={`${BASE}/progress/${isReached ? 'dot-on' : 'dot-off'}.png`}
                alt=""
                className="w-2.5 h-2.5 mt-0.5"
                draggable={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────
   Loading 畫面
   ────────────────────────────────────── */
function LoadingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0e8]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src={`${BASE}/loading.png`}
        alt="載入中"
        className="w-40 h-40 object-contain"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        draggable={false}
      />
      <motion.p
        className="mt-6 text-[#2a2a2a]/60 text-sm tracking-widest"
        style={{ fontFamily: QUIZ_FONT }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        正在為你準備測驗⋯
      </motion.p>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   封面頁
   影片背景 + 標題 + 跑馬燈 + 開始按鈕
   ────────────────────────────────────── */
function CoverPage({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 背景影片 */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/soul-guitar-cover.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      {/* 暗色疊層讓文字更清楚 */}
      <div className="absolute inset-0 bg-black/30" />

      {/* 內容 */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-16">
        {/* 上方留白 */}
        <div />

        {/* 中間：標題 */}
        <div className="flex flex-col items-center gap-8">
          <motion.img
            src={`${BASE}/cover-title.png`}
            alt="解鎖你的吉他靈魂檔案"
            className="w-[75%] max-w-[300px] h-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            draggable={false}
          />

          {/* 開始按鈕 */}
          <motion.button
            type="button"
            onClick={onStart}
            className="px-10 py-3.5 rounded-full border-2 border-white/80 text-white text-sm tracking-[0.2em] hover:bg-white/20 active:scale-95 transition-all"
            style={{ fontFamily: QUIZ_FONT }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            開始測驗
          </motion.button>
        </div>

        {/* 底部：跑馬燈 */}
        <motion.div
          className="w-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <div className="flex animate-marquee">
            {/* 重複兩次做無限滾動 */}
            <img
              src={`${BASE}/cover-marquee.png`}
              alt=""
              className="h-5 w-auto shrink-0 mr-12"
              draggable={false}
            />
            <img
              src={`${BASE}/cover-marquee.png`}
              alt=""
              className="h-5 w-auto shrink-0 mr-12"
              draggable={false}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   主元件
   封面 → Loading → 7 題 → 結果
   ────────────────────────────────────── */
export default function SoulGuitarQuiz() {
  const [phase, setPhase] = useState<'cover' | 'loading' | 'quiz'>('cover');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [direction, setDirection] = useState(1);

  const question = questions[currentQ];
  const isFirstQ = currentQ === 0;

  const handleStart = () => setPhase('loading');
  const handleLoadingDone = () => setPhase('quiz');

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setDirection(1);
        setCurrentQ(currentQ + 1);
      } else {
        // TODO: 最後一題 → 顯示結果
      }
    }, 500);
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ(currentQ - 1);
    }
  };

  // 滑動方向的動畫變數
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div
      className="w-full min-h-dvh flex items-center justify-center"
      style={{ backgroundColor: WALL_COLOR }}
    >
      {/* 手機卡片 */}
      <div className="relative w-full max-w-[430px] h-dvh mx-auto overflow-hidden">
        <AnimatePresence>
          {/* 封面 */}
          {phase === 'cover' && <CoverPage onStart={handleStart} />}

          {/* Loading */}
          {phase === 'loading' && <LoadingScreen onDone={handleLoadingDone} />}
        </AnimatePresence>

        {/* 題目（phase=quiz 時顯示） */}
        {phase === 'quiz' && (
          <div className="flex flex-col h-full">
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentQ}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  {/* 背景圖片 */}
                  <img
                    src={question.bg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* 互動層 */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* 頂部：上一題 + 進度條 */}
                    <div className="flex items-center px-4 pt-4 gap-2">
                      {/* 上一題按鈕 */}
                      {!isFirstQ ? (
                        <motion.button
                          type="button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={handlePrev}
                          className="shrink-0 flex items-center gap-0.5 rounded-full bg-white/40 backdrop-blur-sm pl-1 pr-2.5 py-1 text-[#2a2a2a]/70 hover:bg-white/60 hover:text-[#2a2a2a] transition-all"
                        >
                          <ChevronLeft size={14} />
                          <span className="text-[10px]" style={{ fontFamily: QUIZ_FONT }}>上一題</span>
                        </motion.button>
                      ) : (
                        <div className="w-14" />
                      )}

                      {/* 進度條（在 Q 旁邊） */}
                      <div className="flex-1">
                        <ProgressBar current={currentQ} />
                      </div>
                    </div>

                    {/* 留白 — 讓出背景圖中的題目文字 */}
                    <div className="flex-none" style={{ height: '42%' }} />

                    {/* 選項按鈕 */}
                    <div className="flex-1 flex flex-col justify-start px-5 gap-2">
                      {question.options.map((opt, i) => (
                        <QuizOption
                          key={`${currentQ}-${i}`}
                          label={opt}
                          onClick={() => handleSelect(i)}
                          delay={0.05 + i * 0.06}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
