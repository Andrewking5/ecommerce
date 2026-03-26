import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

/** Fret dot — fingerboard inlay marker used as checkbox/indicator */
export default function FretDot({ active, className = '' }: { active: boolean; className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={cn('flex-shrink-0', className)}>
      <rect x="1" y="1" width="14" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1" opacity={active ? 0.6 : 0.15} />
      <motion.circle
        cx="8" cy="8"
        r={active ? 4.5 : 0}
        fill="currentColor"
        initial={false}
        animate={{ r: active ? 4.5 : 0, opacity: active ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      />
    </svg>
  );
}
