/** Bridge pin — used for add-to-cart buttons */
export default function BridgePinIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M10 12l-2 10h8l-2-10" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}
