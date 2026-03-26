import { cn } from '@/src/lib/utils';

/**
 * GlowingCard — Ayers' signature rotating conic-gradient border glow.
 * Uses CSS @property --glow-angle animated via keyframes for GPU-accelerated rotation.
 * Wrap any card content to add the shimmering gold border effect.
 */
export default function GlowingCard({
  children,
  className = '',
  borderRadius = '1.25rem',
  glowWidth = 2,
}: {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string;
  glowWidth?: number;
}) {
  return (
    <div
      className={cn('relative group/glow', className)}
      style={{
        borderRadius,
        padding: `${glowWidth}px`,
        background: `conic-gradient(from var(--glow-angle, 0deg), transparent 0%, rgba(197,160,89,0.6) 10%, transparent 20%, transparent 50%, rgba(197,160,89,0.4) 60%, transparent 70%)`,
        animation: 'glow-rotate 6s linear infinite',
      }}
    >
      {/* Blurred glow layer behind */}
      <div
        className="absolute inset-0 opacity-40 blur-md pointer-events-none"
        style={{
          borderRadius,
          background: `conic-gradient(from var(--glow-angle, 0deg), transparent 0%, rgba(197,160,89,0.5) 10%, transparent 20%, transparent 50%, rgba(197,160,89,0.3) 60%, transparent 70%)`,
          animation: 'glow-rotate 6s linear infinite',
        }}
      />
      {/* Inner content */}
      <div
        className="relative z-10"
        style={{
          borderRadius: `calc(${borderRadius} - ${glowWidth}px)`,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
