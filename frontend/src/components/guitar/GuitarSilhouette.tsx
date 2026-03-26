/** Guitar body outline — used in empty/error states */
export default function GuitarSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg width="64" height="100" viewBox="0 0 60 100" fill="none" className={className}>
      <path
        d="M30 3 L30 33 M23 18 L37 18 M19 33 Q14 41 14 52 Q14 63 17 69 Q11 73 11 82 Q11 94 22 97 Q28 99 30 99 Q32 99 38 97 Q49 94 49 82 Q49 73 43 69 Q46 63 46 52 Q46 41 41 33 Z"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="30" cy="74" r="9" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="30" cy="74" r="6" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = 30 + Math.cos(angle) * 7.5;
        const y = 74 + Math.sin(angle) * 7.5;
        return <circle key={i} cx={x} cy={y} r="0.5" fill="currentColor" opacity="0.3" />;
      })}
      <rect x="24" y="84" width="12" height="2" rx="1" stroke="currentColor" strokeWidth="0.6" />
      {[-3, -1.5, 0, 1.5, 3].map((offset, idx) => (
        <line key={idx} x1={28.5 + offset * 0.3} y1="18" x2={28.5 + offset * 0.7} y2="92" stroke="currentColor" strokeWidth="0.25" opacity="0.3" />
      ))}
    </svg>
  );
}
