/** Rosette ring — concentric circles around a guitar sound hole. Decorative accent. */
export default function Rosette({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const x = 24 + Math.cos(angle) * 16;
        const y = 24 + Math.sin(angle) * 16;
        return <circle key={i} cx={x} cy={y} r="0.6" fill="currentColor" opacity="0.12" />;
      })}
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="0.4" opacity="0.08" />
    </svg>
  );
}
