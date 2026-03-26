import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

/**
 * WordMaskReveal — Each word slides up from behind an overflow:hidden mask.
 * The Awwwards-standard text entrance animation.
 */
export default function WordMaskReveal({
  text,
  className = '',
  delay = 0,
  stagger = 0.06,
  as: Tag = 'span',
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-12%' });

  const words = text.split(' ');

  return (
    // @ts-expect-error dynamic tag type
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.28em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: '115%', rotateX: 35 }}
            animate={isInView ? { y: '0%', rotateX: 0 } : { y: '115%', rotateX: 35 }}
            transition={{
              duration: 0.75,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
