/**
 * StringPluck — 互動式撥弦效果
 * 滑鼠/手指經過時觸發弦振動，帶 spring 物理
 * 用在 CTA 區塊增加互動趣味
 */
import { useRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StringPluckProps {
  /** 弦數量 */
  count?: number;
  className?: string;
}

interface StringState {
  amplitude: number;
  velocity: number;
  phase: number;
}

export default function StringPluck({ count = 5, className = '' }: StringPluckProps) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);
  const stringsRef = useRef<StringState[]>(
    Array.from({ length: count }, () => ({ amplitude: 0, velocity: 0, phase: 0 })),
  );
  const [, forceUpdate] = useState(0);

  const DAMPING = 0.96;
  const STIFFNESS = 0.15;
  const POINTS = 50;

  // 物理模擬
  useEffect(() => {
    let running = true;

    const tick = () => {
      if (!running) return;

      let anyActive = false;
      stringsRef.current.forEach((s) => {
        if (Math.abs(s.amplitude) > 0.1 || Math.abs(s.velocity) > 0.1) {
          // 簡諧運動 + 阻尼
          s.velocity += -STIFFNESS * s.amplitude;
          s.velocity *= DAMPING;
          s.amplitude += s.velocity;
          s.phase += 0.15;
          anyActive = true;
        } else {
          s.amplitude = 0;
          s.velocity = 0;
        }
      });

      if (anyActive) {
        forceUpdate((n) => n + 1);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // 撥弦 — 滑鼠經過時觸發
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;
      const spacing = height / (count + 1);

      // 找最近的弦
      for (let i = 0; i < count; i++) {
        const stringY = (i + 1) * spacing;
        const dist = Math.abs(y - stringY);
        if (dist < spacing * 0.35) {
          const s = stringsRef.current[i];
          // 只在弦靜止或振幅小時撥動
          if (Math.abs(s.amplitude) < 5) {
            // 撥弦力道根據接近程度
            const force = (1 - dist / (spacing * 0.35)) * 18;
            s.velocity += (y > stringY ? -1 : 1) * force;
          }
          break;
        }
      }
    },
    [count],
  );

  const buildStringPath = useCallback(
    (width: number, height: number, index: number) => {
      const spacing = height / (count + 1);
      const baseY = (index + 1) * spacing;
      const s = stringsRef.current[index];

      if (Math.abs(s.amplitude) < 0.1) {
        return `M 0 ${baseY} L ${width} ${baseY}`;
      }

      const parts: string[] = [`M 0 ${baseY}`];
      for (let p = 1; p <= POINTS; p++) {
        const t = p / POINTS;
        const x = t * width;
        // 駐波 — 兩端固定
        const standing = Math.sin(Math.PI * t);
        // 加上二次諧波讓形狀更有機
        const harmonic = Math.sin(2 * Math.PI * t) * 0.3;
        const wave = (standing + harmonic) * s.amplitude * Math.cos(s.phase);
        parts.push(`L ${x.toFixed(1)} ${(baseY + wave).toFixed(2)}`);
      }
      return parts.join(' ');
    },
    [count],
  );

  // 取得 SVG 尺寸
  const rect = svgRef.current?.getBoundingClientRect();
  const w = rect?.width ?? 800;
  const h = rect?.height ?? 300;

  return (
    <svg
      ref={svgRef}
      onMouseMove={handleMouseMove}
      className={`absolute inset-0 w-full h-full cursor-crosshair ${className}`}
      preserveAspectRatio="none"
    >
      {/* 弦 */}
      {Array.from({ length: count }).map((_, i) => {
        const opacity = 0.12 + (i / count) * 0.15;
        const thickness = 2.2 - (i / count) * 1.2;

        return (
          <path
            key={i}
            d={buildStringPath(w, h, i)}
            fill="none"
            stroke={`rgba(197,160,89,${opacity + (Math.abs(stringsRef.current[i]?.amplitude ?? 0) > 1 ? 0.25 : 0)})`}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
        );
      })}

      {/* 提示文字 */}
      <text
        x="50%"
        y="95%"
        textAnchor="middle"
        className="fill-white/10 text-[10px] uppercase tracking-[0.3em]"
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 9 }}
      >
        {t('notFound.slideToPluck', 'slide to pluck')}
      </text>
    </svg>
  );
}
