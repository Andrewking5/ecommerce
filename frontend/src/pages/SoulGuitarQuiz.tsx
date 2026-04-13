import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ──────────────────────────────────────
   Soul Guitar — 心理測驗
   使用原始圖片當背景，互動按鈕覆蓋在上面
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

// 圖片中牆壁的主色，用於電腦版兩側邊框
const WALL_COLOR = '#6ba3b5';

export default function SoulGuitarQuiz() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center"
      style={{ backgroundColor: WALL_COLOR }}
    >
      {/* 手機卡片容器 — 最大寬度限制，電腦版兩側露出邊框色 */}
      <div className="relative w-full max-w-[430px] mx-auto" style={{ aspectRatio: '9/16' }}>
        {/* 背景圖片 */}
        <img
          src="/images/events/quiz/q1.jpg"
          alt="Q1 背景"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* 互動按鈕覆蓋層 — 用百分比定位對齊圖片中的按鈕位置 */}
        <div className="absolute inset-0 flex flex-col">
          {/*
            圖片佈局分析 (1080x1920):
            - Q1 標題 + 問題文字：約 top 18% ~ 38%
            - 四個選項按鈕：約 top 40% ~ 70%
            - 每個按鈕高度約 5.5%，間距約 2%
          */}
          <div className="flex-1" style={{ minHeight: '40%' }} />

          {/* 透明互動按鈕，精確覆蓋圖片中的選項位置 */}
          <div className="px-[10%] flex flex-col gap-[1.8%]">
            <AnimatePresence>
              {question.options.map((opt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelected(i)}
                  className={`
                    w-full py-[3.2%] px-6 rounded-full text-[0.95rem] font-medium
                    transition-all duration-200 border-2 text-center
                    ${
                      selected === i
                        ? 'bg-[#2a2a2a] text-white border-[#2a2a2a] shadow-lg'
                        : 'bg-transparent text-transparent border-transparent hover:bg-white/10'
                    }
                  `}
                >
                  {opt}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex-1" />

          {/* 選擇後顯示下一題按鈕 */}
          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pb-[8%] flex justify-center"
              >
                <button className="px-10 py-3 rounded-full bg-[#2a2a2a] text-white font-bold text-sm tracking-wider hover:bg-[#1a1a1a] transition-colors shadow-lg">
                  下一題 →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
