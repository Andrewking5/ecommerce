/**
 * SunwaveRipple — Ayers Sunwave 聲學技術的視覺化
 * SVG 同心圓聲波從中心向外擴散，綁定滾動進度
 * 像聲音從吉他傳遞出去
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';

interface SunwaveRippleProps {
  /** 波紋數量 */
  rings?: number;
  className?: string;
}

export default function SunwaveRipple({ rings = 6, className = '' }: SunwaveRippleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: '-20%' });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ maxWidth: 500, margin: '0 auto' }}
      >
        {Array.from({ length: rings }).map((_, i) => {
          const baseRadius = 30 + i * 28;
          const delay = i * 0.12;

          return (
            <RippleRing
              key={i}
              index={i}
              baseRadius={baseRadius}
              delay={delay}
              scrollProgress={scrollYProgress}
              isInView={isInView}
              total={rings}
            />
          );
        })}

        {/* 中心點 — 聲音源頭 */}
        <motion.circle
          cx={200}
          cy={200}
          r={8}
          fill="rgba(197,160,89,0.8)"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: [0, 1.3, 1] } : { scale: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <motion.circle
          cx={200}
          cy={200}
          r={3}
          fill="#c5a059"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3 }}
        />
      </svg>
    </div>
  );
}

/** 單一波紋環 */
function RippleRing({
  index,
  baseRadius,
  delay,
  scrollProgress,
  isInView,
  total,
}: {
  index: number;
  baseRadius: number;
  delay: number;
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  isInView: boolean;
  total: number;
}) {
  // 隨滾動展開半徑
  const radius = useTransform(
    scrollProgress,
    [0.1 + delay, 0.4 + delay * 0.5],
    [0, baseRadius],
  );

  // 外圈越透明
  const baseOpacity = 0.6 - (index / total) * 0.45;
  const opacity = useTransform(
    scrollProgress,
    [0.1 + delay, 0.3 + delay, 0.8],
    [0, baseOpacity, baseOpacity * 0.3],
  );

  // 波紋線條寬度 — 內圈粗外圈細
  const strokeWidth = 2.5 - (index / total) * 1.8;

  return (
    <motion.circle
      cx={200}
      cy={200}
      r={radius}
      fill="none"
      stroke="#c5a059"
      strokeWidth={strokeWidth}
      strokeOpacity={opacity}
      initial={{ pathLength: 0 }}
      animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
      transition={{ duration: 1.2, delay: delay, ease: 'easeOut' }}
    />
  );
}
