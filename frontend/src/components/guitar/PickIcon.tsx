/** Guitar pick silhouette */
export default function PickIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C8.5 2 5.5 3.5 4 6c-2 3.5-1.5 7 0 10.5C5.5 19.5 8 22 12 22c4 0 6.5-2.5 8-5.5 1.5-3.5 2-7 0-10.5C18.5 3.5 15.5 2 12 2z" />
    </svg>
  );
}
