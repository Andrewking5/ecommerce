/**
 * FretboardProgress — 吉他指板風格的頁面滾動進度條
 * 固定在右側，品格(fret)標記對應每個區塊
 * 當前區塊的品格點亮金色
 */
import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';

interface Section {
  id: string;
  label: string;
}

interface FretboardProgressProps {
  sections: Section[];
}

export default function FretboardProgress({ sections }: FretboardProgressProps) {
  const { scrollYProgress } = useScroll();
  const [activeIndex, setActiveIndex] = useState(0);

  // 追蹤當前可見的區塊
  useEffect(() => {
    const handleScroll = () => {
      const viewportMid = window.innerHeight / 2;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= viewportMid) {
          setActiveIndex(i);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // 整體進度條高度
  const progressHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-0">
      {/* 指板本體 */}
      <div className="relative w-[3px] bg-white/[0.06] rounded-full" style={{ height: 280 }}>
        {/* 進度填充 — 琴弦上的手指位置 */}
        <motion.div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-ayers-gold/60 to-ayers-gold rounded-full"
          style={{ height: progressHeight }}
        />

        {/* 品格標記 */}
        {sections.map((section, i) => {
          const pos = (i / (sections.length - 1)) * 100;
          const isActive = i === activeIndex;

          return (
            <button
              key={section.id}
              onClick={() => {
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="absolute left-1/2 -translate-x-1/2 group flex items-center"
              style={{ top: `${pos}%` }}
              aria-label={section.label}
            >
              {/* 品格圓點 */}
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.6,
                  backgroundColor: isActive ? '#c5a059' : 'rgba(255,255,255,0.15)',
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-[11px] h-[11px] rounded-full border border-white/10"
              />

              {/* Hover 標籤 */}
              <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap px-2 py-1 rounded-md"
                  style={{
                    color: isActive ? '#c5a059' : 'rgba(255,255,255,0.4)',
                    backgroundColor: 'rgba(21,22,25,0.9)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {section.label}
                </span>
              </div>

              {/* 品格橫線 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 h-px"
                style={{
                  width: 20,
                  backgroundColor: isActive ? 'rgba(197,160,89,0.3)' : 'rgba(255,255,255,0.05)',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
