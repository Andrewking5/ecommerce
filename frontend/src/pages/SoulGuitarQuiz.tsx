import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

/* ──────────────────────────────────────
   Soul Guitar — 心理測驗
   - hover 膨脹按鈕
   - 點擊直接下一題
   - 左上角「上一題」按鈕
   ────────────────────────────────────── */

const questions = [
  {
    id: 1,
    bg: '/images/events/quiz/q1.jpg',
    options: [
      '找一家舒服的小店坐著放鬆',
      '隨便出門走走看看城市',
      '待在房間聽歌或想事情',
      '找朋友出去玩熱鬧一下',
    ],
  },
  // 之後加更多題目...
];

// 圖片牆壁主色 → 電腦版兩側邊框
const WALL_COLOR = '#6ba3b5';
// 未來熒黑字體
const QUIZ_FONT = '"Glow Sans TC", "Noto Sans TC", sans-serif';

/**
 * 漸層邊框膠囊按鈕
 * 預設：漸層邊框 + 白底
 * Hover：灰底白字
 * 點擊：選擇後跳下一題
 */
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="w-full cursor-pointer group relative"
    >
      {/* 漸層邊框外框 — hover 時隱藏 */}
      <div
        className="rounded-full p-[2.5px] transition-opacity duration-200 group-hover:opacity-0"
        style={{
          background: 'linear-gradient(90deg, #c5a059 0%, #d4b06a 30%, #a0b8c0 70%, #6ba3b5 100%)',
        }}
      >
        <div className="rounded-full bg-white py-3.5 px-8">
          <span className="text-[1.1rem] text-[#2a2a2a]" style={{ fontFamily: QUIZ_FONT }}>
            {label}
          </span>
        </div>
      </div>
      {/* hover 灰底白字 — 疊在同位置 */}
      <div className="absolute inset-0 rounded-full bg-[#a0a0a0] py-3.5 px-8 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="text-[1.1rem] text-white" style={{ fontFamily: QUIZ_FONT }}>
          {label}
        </span>
      </div>
    </motion.button>
  );
}

export default function SoulGuitarQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const question = questions[currentQ];
  const isFirstQ = currentQ === 0;

  const handleSelect = (optionIndex: number) => {
    // 儲存答案
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);

    // 短暫延遲後跳下一題（讓使用者看到點擊反饋）
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        // TODO: 最後一題 → 顯示結果
      }
    }, 400);
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  return (
    <div
      className="w-full min-h-dvh flex items-center justify-center"
      style={{ backgroundColor: WALL_COLOR }}
    >
      {/* 手機卡片 — 電腦版兩側露出邊框色 */}
      <div className="relative w-full max-w-[430px] min-h-dvh mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* 背景圖片（含題目文字） */}
            <img
              src={question.bg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* 互動層 */}
            <div className="relative z-10 flex flex-col h-dvh">
              {/* 上一題按鈕 */}
              {!isFirstQ && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={handlePrev}
                  className="absolute top-6 left-4 z-20 flex items-center gap-1 text-[#2a2a2a]/70 hover:text-[#2a2a2a] transition-colors"
                  style={{ fontFamily: QUIZ_FONT }}
                >
                  <ChevronLeft size={20} />
                  <span className="text-sm">上一題</span>
                </motion.button>
              )}

              {/* 上方留白 — 讓出圖片中的題目文字區域 */}
              <div className="flex-none" style={{ height: '52%' }} />

              {/* 選項按鈕 */}
              <div className="flex-1 flex flex-col justify-start px-6 gap-3">
                {question.options.map((opt, i) => (
                  <QuizOption
                    key={`${currentQ}-${i}`}
                    label={opt}
                    onClick={() => handleSelect(i)}
                    delay={0.1 + i * 0.08}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
