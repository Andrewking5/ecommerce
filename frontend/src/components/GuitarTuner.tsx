/**
 * GuitarTuner — Hidden Easter-egg tuner in the Footer.
 * Click the tuning-fork icon to expand a minimal EADGBE tuner.
 * Uses Web Audio API to generate pure sine + harmonic tones.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

const STRINGS: { note: string; freq: number; label: string }[] = [
  { note: 'E2', freq: 82.41, label: '6E' },
  { note: 'A2', freq: 110.0, label: '5A' },
  { note: 'D3', freq: 146.83, label: '4D' },
  { note: 'G3', freq: 196.0, label: '3G' },
  { note: 'B3', freq: 246.94, label: '2B' },
  { note: 'E4', freq: 329.63, label: '1E' },
];

export default function GuitarTuner() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeString, setActiveString] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<{ osc: OscillatorNode[]; gain: GainNode } | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopNote();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playNote = useCallback((freq: number, index: number) => {
    stopNote();
    const ctx = getAudioCtx();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    masterGain.connect(ctx.destination);

    // Fundamental + 2nd harmonic for a richer guitar-like tone
    const oscs: OscillatorNode[] = [];

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.7, ctx.currentTime);
    osc1.connect(g1).connect(masterGain);
    osc1.start();
    oscs.push(osc1);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.2, ctx.currentTime);
    osc2.connect(g2).connect(masterGain);
    osc2.start();
    oscs.push(osc2);

    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, ctx.currentTime);
    const g3 = ctx.createGain();
    g3.gain.setValueAtTime(0.08, ctx.currentTime);
    osc3.connect(g3).connect(masterGain);
    osc3.start();
    oscs.push(osc3);

    activeNodesRef.current = { osc: oscs, gain: masterGain };
    setActiveString(index);

    // Auto-fade after 3 seconds
    masterGain.gain.setValueAtTime(0.25, ctx.currentTime + 2.5);
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.5);
    setTimeout(() => {
      if (activeNodesRef.current?.gain === masterGain) {
        stopNote();
      }
    }, 3600);
  }, [getAudioCtx]);

  const stopNote = useCallback(() => {
    if (activeNodesRef.current) {
      const { osc, gain } = activeNodesRef.current;
      try {
        const ctx = audioCtxRef.current;
        if (ctx && ctx.state !== 'closed') {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
        }
        osc.forEach(o => { try { o.stop(); } catch {} });
      } catch {}
      activeNodesRef.current = null;
    }
    setActiveString(null);
  }, []);

  return (
    <div className="relative inline-flex items-center">
      {/* Tuning fork icon — the hidden trigger */}
      <button
        onClick={() => { setOpen(!open); if (open) stopNote(); }}
        className="group relative p-1.5 rounded-full hover:bg-white/10 transition-colors"
        aria-label={t('footer.tuner', 'Guitar Tuner')}
        title={t('footer.tuner', 'Guitar Tuner')}
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          className="text-white/20 group-hover:text-ayers-gold transition-colors"
        >
          {/* Tuning fork shape */}
          <path
            d="M8 2v8c0 2.2 1.8 4 4 4s4-1.8 4-4V2M12 14v8M9 22h6"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        {/* Subtle pulse when closed to hint at interactivity */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full border border-white/10"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          />
        )}
      </button>

      {/* Tuner panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-ayers-espresso/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[220px]"
          >
            {/* Header */}
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-ayers-gold/60 text-center mb-3">
              {t('footer.tunerTitle', 'Standard Tuning')}
            </p>

            {/* String buttons */}
            <div className="flex gap-2 justify-center">
              {STRINGS.map((s, i) => (
                <button
                  key={s.note}
                  onClick={() => activeString === i ? stopNote() : playNote(s.freq, i)}
                  className={`
                    relative flex flex-col items-center justify-center w-8 h-12 rounded-lg text-xs font-mono
                    transition-all duration-200
                    ${activeString === i
                      ? 'bg-ayers-gold text-ayers-espresso shadow-lg shadow-ayers-gold/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  <span className="text-[10px] font-bold">{s.label.slice(1)}</span>
                  <span className="text-[7px] opacity-50">{s.label[0]}</span>
                  {/* Vibration indicator */}
                  {activeString === i && (
                    <motion.span
                      className="absolute inset-0 rounded-lg border border-ayers-gold/50"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Frequency readout */}
            <AnimatePresence mode="wait">
              {activeString !== null && (
                <motion.p
                  key={activeString}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-[10px] text-white/30 mt-2 font-mono"
                >
                  {STRINGS[activeString].freq.toFixed(2)} Hz
                </motion.p>
              )}
            </AnimatePresence>

            {/* Triangle pointer */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-ayers-espresso/95 border-r border-b border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
