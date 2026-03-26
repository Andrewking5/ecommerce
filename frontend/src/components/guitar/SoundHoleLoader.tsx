import { motion } from 'motion/react';

/** Loading spinner with concentric sound hole rings pulsing + rosette dots rotating */
export default function SoundHoleLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-6">
      <div className="relative w-24 h-24">
        {[22, 18, 14, 8].map((r, i) => (
          <motion.svg key={r} className="absolute inset-0" width="96" height="96" viewBox="0 0 96 96">
            <motion.circle
              cx="48" cy="48" r={r * 2}
              fill="none" stroke="#C5A059" strokeWidth={i === 0 ? 0.8 : 0.5}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.3, 0], scale: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
            />
          </motion.svg>
        ))}
        <motion.svg
          className="absolute inset-0" width="96" height="96" viewBox="0 0 96 96"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const x = 48 + Math.cos(angle) * 30;
            const y = 48 + Math.sin(angle) * 30;
            return <circle key={i} cx={x} cy={y} r="1" fill="#C5A059" opacity={0.2 + (i % 3) * 0.1} />;
          })}
        </motion.svg>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-ayers-ink/20">Loading</p>
    </div>
  );
}
