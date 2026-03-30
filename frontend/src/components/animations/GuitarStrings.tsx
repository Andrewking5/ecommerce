/**
 * GuitarStrings — 6 條 SVG 琴弦在頁面載入時被「撥動」振動
 * 用 sine wave 數學公式動態產生真實弦振動曲線，振幅指數衰減
 */
import { useEffect, useRef, useCallback } from 'react';

interface GuitarStringsProps {
  /** 動畫是否開始 */
  play?: boolean;
  className?: string;
}

// 6 弦粗細 & 延遲 (模擬從低音到高音依序撥動)
const STRINGS = [
  { thickness: 2.4, delay: 0, freq: 1.8, color: 'rgba(197,160,89,0.55)' },
  { thickness: 2.0, delay: 120, freq: 2.2, color: 'rgba(197,160,89,0.48)' },
  { thickness: 1.7, delay: 220, freq: 2.8, color: 'rgba(197,160,89,0.42)' },
  { thickness: 1.3, delay: 310, freq: 3.4, color: 'rgba(197,160,89,0.36)' },
  { thickness: 1.0, delay: 400, freq: 4.2, color: 'rgba(197,160,89,0.30)' },
  { thickness: 0.7, delay: 480, freq: 5.0, color: 'rgba(197,160,89,0.25)' },
];

const DURATION = 3000; // 總振動時間 ms
// 行動裝置用較少取樣點以提升效能
const POINTS = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 80;

export default function GuitarStrings({ play = true, className = '' }: GuitarStringsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number[]>(new Array(6).fill(-1));

  const buildPath = useCallback(
    (width: number, height: number, stringIndex: number, elapsed: number) => {
      const s = STRINGS[stringIndex];
      // 弦的 Y 位置：均勻分佈在 SVG 高度中
      const baseY = ((stringIndex + 1) / (STRINGS.length + 1)) * height;
      // 最大振幅隨弦粗細而異
      const maxAmp = 8 + s.thickness * 4;
      // 指數衰減
      const decay = Math.exp(-elapsed / (DURATION * 0.35));
      const amp = maxAmp * decay;

      if (amp < 0.15) {
        // 振動結束，畫直線
        return `M 0 ${baseY} L ${width} ${baseY}`;
      }

      const parts: string[] = [`M 0 ${baseY}`];
      for (let i = 1; i <= POINTS; i++) {
        const t = i / POINTS;
        const x = t * width;
        // 駐波: sin(n*pi*t) 讓兩端固定
        const standing = Math.sin(Math.PI * t);
        // 行波
        const wave = Math.sin(s.freq * 2 * Math.PI * t - elapsed * 0.008 * s.freq);
        const y = baseY + amp * standing * wave;
        parts.push(`L ${x.toFixed(1)} ${y.toFixed(2)}`);
      }
      return parts.join(' ');
    },
    [],
  );

  useEffect(() => {
    if (!play || !svgRef.current) return;

    const svg = svgRef.current;
    const paths = svg.querySelectorAll<SVGPathElement>('path[data-string]');
    const globalStart = performance.now();

    // 重設
    startTimeRef.current = STRINGS.map((s) => globalStart + s.delay);

    const animate = (now: number) => {
      const { width, height } = svg.getBoundingClientRect();
      if (width === 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      let anyActive = false;
      paths.forEach((path, i) => {
        const start = startTimeRef.current[i];
        if (now < start) {
          // 還沒開始，畫直線
          const baseY = ((i + 1) / (STRINGS.length + 1)) * height;
          path.setAttribute('d', `M 0 ${baseY} L ${width} ${baseY}`);
          anyActive = true;
          return;
        }
        const elapsed = now - start;
        if (elapsed > DURATION + 500) {
          // 結束
          const baseY = ((i + 1) / (STRINGS.length + 1)) * height;
          path.setAttribute('d', `M 0 ${baseY} L ${width} ${baseY}`);
          return;
        }
        anyActive = true;
        path.setAttribute('d', buildPath(width, height, i, elapsed));
      });

      if (anyActive) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [play, buildPath]);

  return (
    <svg
      ref={svgRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      preserveAspectRatio="none"
    >
      {STRINGS.map((s, i) => (
        <path
          key={i}
          data-string={i}
          fill="none"
          stroke={s.color}
          strokeWidth={s.thickness}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
