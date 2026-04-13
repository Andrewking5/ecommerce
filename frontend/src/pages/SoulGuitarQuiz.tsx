import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ──────────────────────────────────────
   Soul Guitar — 心理測驗 Q1
   背景：原始圖片（含 Q1 文字）
   按鈕：漸層邊框膠囊（未選）/ 灰底白字（已選）
   ────────────────────────────────────── */

const question = {
  id: 1,
  options: [
    '找一家舒服的小店坐著放鬆',
    '隨便出門走走看看城市',
    '待在房間聽歌或想事情',
    '找朋友出去玩熱鬧一下',
  ],
};

// 圖片牆壁主色 → 電腦版兩側邊框
const WALL_COLOR = '#6ba3b5';
// 未來熒黑字體
const QUIZ_FONT = '"Glow Sans TC", "Noto Sans TC", sans-serif';

/** 漸層邊框膠囊按鈕 */
function QuizOption({
  label,
  selected,
  onClick,
  delay,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full cursor-pointer"
    >
      {selected ? (
        /* ── 已選：灰底白字，膨脹到完整大小 ── */}
        <motion.div
          className="rounded-full bg-[#a0a0a0] px-6"
          initial={{ paddingTop: 6, paddingBottom: 6 }}
          animate={{ paddingTop: 12, paddingBottom: 12 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <motion.span
            className="block"
            style={{ fontFamily: QUIZ_FONT, color: '#fff' }}
            initial={{ fontSize: '0.85rem' }}
            animate={{ fontSize: '1.05rem' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {label}
          </motion.span>
        </motion.div>
      ) : (
        /* ── 未選：漸層邊框 + 白底，較矮 ── */
        <div
          className="rounded-full p-[2.5px]"
          style={{
            background: 'linear-gradient(90deg, #c5a059 0%, #d4b06a 30%, #a0b8c0 70%, #6ba3b5 100%)',
          }}
        >
          <div className="rounded-full bg-white py-1.5 px-6">
            <span className="text-[0.85rem] text-[#2a2a2a]" style={{ fontFamily: QUIZ_FONT }}>{label}</span>
          </div>
        </div>
      )}
    </motion.button>
  );
}

export default function SoulGuitarQuiz() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div
      className="w-full min-h-dvh flex items-center justify-center"
      style={{ backgroundColor: WALL_COLOR }}
    >
      {/* 手機卡片 — 電腦版兩側露出邊框色 */}
      <div className="relative w-full max-w-[430px] min-h-dvh mx-auto overflow-hidden">
        {/* 背景圖片（含 Q1 文字） */}
        <img
          src="/images/events/quiz/q1.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* 互動層 */}
        <div className="relative z-10 flex flex-col h-dvh">
          {/* 上方留白 — 讓出圖片中的 Q1 文字區域（約佔 52%） */}
          <div className="flex-none" style={{ height: '52%' }} />

          {/* 選項按鈕 */}
          <div className="flex-1 flex flex-col justify-start px-6 gap-3">
            {question.options.map((opt, i) => (
              <QuizOption
                key={i}
                label={opt}
                selected={selected === i}
                onClick={() => setSelected(i)}
                delay={0.1 + i * 0.08}
              />
            ))}

            {/* 下一題 */}
            <AnimatePresence>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex justify-center"
                >
                  <button
                    type="button"
                    className="px-10 py-3 rounded-full bg-ayers-ink text-white font-bold text-sm tracking-wider hover:bg-ayers-ink/80 transition-colors shadow-lg"
                  >
                    下一題 →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
