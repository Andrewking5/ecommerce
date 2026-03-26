/** Tuning peg — used for filter/settings buttons */
export default function TuningPegIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      <line x1="12" y1="2" x2="12" y2="14" />
      <rect x="8" y="14" width="8" height="4" rx="2" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <circle cx="12" cy="8" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
