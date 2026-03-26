/**
 * GuitarSunLoader — 全站載入動畫
 * 用 guitar-sun.png 旋轉作為 loading spinner
 * 替代所有 Loader2 animate-spin
 */
interface Props {
  size?: number;    // px, default 32
  className?: string;
  text?: string;    // optional loading text below
}

export default function GuitarSunLoader({ size = 48, className = '', text }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <img
        src="/images/ayers/guitar-sun.png"
        alt="Loading"
        className="select-none"
        style={{
          width: size,
          height: size,
          animation: 'spin 4s linear infinite',
          opacity: 1,
          filter: 'contrast(1.3) saturate(1.2)',
        }}
        draggable={false}
      />
      {text && <span className="text-[11px] text-ayers-ink/50 font-light tracking-widest uppercase">{text}</span>}
    </div>
  );
}
