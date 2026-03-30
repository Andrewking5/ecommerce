/**
 * GuitarSunLoader — 全站小太陽
 * 統一旋轉速度：loading 用 4s，裝飾用 25s
 */
interface Props {
  size?: number;
  className?: string;
  text?: string;
  speed?: 'fast' | 'slow';   // fast=4s(loading), slow=25s(裝飾)
  opacity?: number;
}

export default function GuitarSunLoader({ size = 48, className = '', text, speed = 'fast', opacity = 1 }: Props) {
  const duration = speed === 'fast' ? '4s' : '25s';
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <img
        src="/images/ayers/guitar-sun.png"
        alt="Loading"
        className="select-none"
        style={{ width: size, height: size, animation: `spin ${duration} linear infinite`, opacity }}
        draggable={false}
      />
      {text && <span className="text-[11px] text-ayers-ink/50 font-light tracking-widest uppercase">{text}</span>}
    </div>
  );
}

/**
 * FullPageLoader — 全頁置中 loading（統一樣式）
 * bg: 預設 ayers-cream，Admin 可覆蓋
 */
interface FullPageLoaderProps {
  size?: number;
  text?: string;
  bg?: string;        // Tailwind bg class 或 inline style 都可
  bgStyle?: string;   // 用 inline style（Admin 深色背景用）
}

export function FullPageLoader({ size = 48, text, bg = 'bg-ayers-cream', bgStyle }: FullPageLoaderProps) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center ${bgStyle ? '' : bg}`}
      style={bgStyle ? { background: bgStyle } : undefined}
    >
      <GuitarSunLoader size={size} text={text} />
    </div>
  );
}
