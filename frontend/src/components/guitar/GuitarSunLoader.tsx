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
