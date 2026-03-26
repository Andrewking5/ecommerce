import { cn } from '@/src/lib/utils';

/** Horizontal divider mimicking 6 guitar strings of varying thickness */
export default function StringDivider({ className = '' }: { className?: string }) {
  return (
    <div className={cn('relative py-0.5', className)}>
      {[0.8, 0.6, 0.5, 0.4, 0.35, 0.3].map((w, i) => (
        <div
          key={i}
          className="w-full bg-ayers-ink rounded-full"
          style={{ height: `${w}px`, opacity: 0.06 + i * 0.01, marginBottom: i < 5 ? '2px' : 0 }}
        />
      ))}
    </div>
  );
}
