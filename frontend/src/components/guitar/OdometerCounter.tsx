import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

/**
 * OdometerCounter — Each digit rolls independently in a vertical carousel.
 * Creates the premium rolling-number effect seen on Awwwards sites.
 */
export default function OdometerCounter({
  value,
  suffix = '',
  className = '',
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const digits = String(value).split('');

  return (
    <span ref={ref} className={`inline-flex items-baseline ${className}`}>
      {digits.map((digit, i) => (
        <RollingDigit key={i} digit={Number(digit)} delay={i * 0.1} active={isInView} />
      ))}
      {suffix && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, delay: digits.length * 0.1 + 0.3 }}
        >
          {suffix}
        </motion.span>
      )}
    </span>
  );
}

function RollingDigit({ digit, delay, active }: { digit: number; delay: number; active: boolean }) {
  return (
    <span className="inline-block overflow-hidden h-[1em] relative" style={{ width: '0.62em' }}>
      <motion.span
        className="inline-flex flex-col absolute left-0 w-full"
        initial={{ y: '0%' }}
        animate={active ? { y: `${-digit * 10}%` } : { y: '0%' }}
        transition={{
          duration: 1.4,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1em] flex items-center justify-center tabular-nums">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
