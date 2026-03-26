/**
 * WoodGrainReveal — 木紋路徑生長動畫
 * 用 SVG 手繪有機曲線 + stroke-dashoffset 模擬木紋在生長
 * 內容從木紋中浮現
 */
import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

interface WoodGrainRevealProps {
  children: React.ReactNode;
  /** 木紋方向 */
  direction?: 'left' | 'right';
  className?: string;
}

// 手繪的有機木紋路徑 — 模擬真實木頭年輪紋理
const GRAIN_PATHS = [
  // 主要紋路 — 長弧線
  'M -20 50 C 60 45, 120 65, 200 55 S 350 40, 420 58',
  // 次要紋路 — 稍短的波浪
  'M -10 120 C 50 110, 130 135, 220 118 S 340 105, 420 125',
  // 細紋 — 年輪
  'M -15 185 C 70 178, 150 200, 250 188 S 370 175, 420 192',
  // 結節紋路 — 有個小彎
  'M -10 250 C 80 242, 120 270, 170 255 C 220 240, 280 265, 350 248 L 420 255',
  // 底部淡紋
  'M -20 310 C 60 305, 160 325, 260 312 S 380 298, 420 315',
];

export default function WoodGrainReveal({
  children,
  direction = 'left',
  className = '',
}: WoodGrainRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-15%' });

  const isRight = direction === 'right';

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* 木紋 SVG 覆蓋層 */}
      <svg
        viewBox="0 0 400 360"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        preserveAspectRatio="none"
        style={{ transform: isRight ? 'scaleX(-1)' : undefined }}
      >
        {GRAIN_PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(197,160,89,0.15)"
            strokeWidth={2.5 - i * 0.3}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              isInView
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{
              pathLength: {
                duration: 1.8,
                delay: i * 0.2,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: { duration: 0.3, delay: i * 0.2 },
            }}
          />
        ))}
      </svg>

      {/* 內容 — 在木紋繪製後淡入 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
