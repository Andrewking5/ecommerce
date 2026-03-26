import { motion } from 'motion/react';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRef, useCallback, useEffect, useState } from 'react';
import { PickIcon } from '../components/guitar';

/* ── Background broken-string physics (adapted from StringPluck) ── */

interface BrokenStringState {
  amplitude: number;
  velocity: number;
  phase: number;
  broken: boolean;
  breakPoint: number;
  snapProgress: number;
}

const STRING_COUNT = 6;
const DAMPING = 0.95;
const STIFFNESS = 0.12;
const POINTS = 50;
const BROKEN_INDICES = new Set([2, 3]);

function initStrings(): BrokenStringState[] {
  return Array.from({ length: STRING_COUNT }, (_, i) => ({
    amplitude: 0,
    velocity: 0,
    phase: 0,
    broken: BROKEN_INDICES.has(i),
    breakPoint: 0.35 + Math.random() * 0.3,
    snapProgress: BROKEN_INDICES.has(i) ? 1 : 0,
  }));
}

function BrokenGuitarStrings({ className = '' }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);
  const stringsRef = useRef<BrokenStringState[]>(initStrings());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      let anyActive = false;
      stringsRef.current.forEach((s) => {
        if (Math.abs(s.amplitude) > 0.1 || Math.abs(s.velocity) > 0.1) {
          s.velocity += -STIFFNESS * s.amplitude;
          s.velocity *= DAMPING;
          s.amplitude += s.velocity;
          s.phase += 0.15;
          anyActive = true;
        } else {
          s.amplitude = 0;
          s.velocity = 0;
        }
        if (s.broken && s.snapProgress < 1) {
          s.snapProgress = Math.min(1, s.snapProgress + 0.04);
          anyActive = true;
        }
      });
      if (anyActive) forceUpdate((n) => n + 1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const spacing = height / (STRING_COUNT + 1);
    for (let i = 0; i < STRING_COUNT; i++) {
      const stringY = (i + 1) * spacing;
      const dist = Math.abs(y - stringY);
      if (dist < spacing * 0.35) {
        const s = stringsRef.current[i];
        if (Math.abs(s.amplitude) < 5) {
          const force = (1 - dist / (spacing * 0.35)) * (s.broken ? 8 : 18);
          s.velocity += (y > stringY ? -1 : 1) * force;
        }
        break;
      }
    }
  }, []);

  const rect = svgRef.current?.getBoundingClientRect();
  const w = rect?.width ?? 800;
  const h = rect?.height ?? 400;

  const buildPath = useCallback((width: number, height: number, index: number) => {
    const spacing = height / (STRING_COUNT + 1);
    const baseY = (index + 1) * spacing;
    const s = stringsRef.current[index];

    if (s.broken) {
      const bx = s.breakPoint * width;
      const leftParts: string[] = [`M 0 ${baseY}`];
      for (let p = 1; p <= Math.floor(POINTS * s.breakPoint); p++) {
        const t = p / POINTS;
        const x = t * width;
        const wave = Math.sin(Math.PI * (t / s.breakPoint)) * s.amplitude * 0.5 * Math.cos(s.phase);
        leftParts.push(`L ${x.toFixed(1)} ${(baseY + wave).toFixed(2)}`);
      }
      const curlY = baseY + 12 * s.snapProgress + s.amplitude * 0.3 * Math.cos(s.phase);
      leftParts.push(`L ${(bx + 5).toFixed(1)} ${curlY.toFixed(2)}`);

      const rightParts: string[] = [];
      const rx = bx + 8;
      const curlY2 = baseY + 15 * s.snapProgress + s.amplitude * 0.4 * Math.sin(s.phase);
      rightParts.push(`M ${width} ${baseY}`);
      for (let p = POINTS; p >= Math.ceil(POINTS * s.breakPoint) + 1; p--) {
        const t = p / POINTS;
        const x = t * width;
        const localT = (t - s.breakPoint) / (1 - s.breakPoint);
        const wave = Math.sin(Math.PI * localT) * s.amplitude * 0.5 * Math.cos(s.phase + 1);
        rightParts.push(`L ${x.toFixed(1)} ${(baseY + wave).toFixed(2)}`);
      }
      rightParts.push(`L ${rx.toFixed(1)} ${curlY2.toFixed(2)}`);
      return { left: leftParts.join(' '), right: rightParts.join(' ') };
    }

    if (Math.abs(s.amplitude) < 0.1) {
      return { left: `M 0 ${baseY} L ${width} ${baseY}`, right: '' };
    }
    const parts: string[] = [`M 0 ${baseY}`];
    for (let p = 1; p <= POINTS; p++) {
      const t = p / POINTS;
      const x = t * width;
      const standing = Math.sin(Math.PI * t);
      const harmonic = Math.sin(2 * Math.PI * t) * 0.3;
      const wave = (standing + harmonic) * s.amplitude * Math.cos(s.phase);
      parts.push(`L ${x.toFixed(1)} ${(baseY + wave).toFixed(2)}`);
    }
    return { left: parts.join(' '), right: '' };
  }, []);

  return (
    <svg
      ref={svgRef}
      onMouseMove={handleMouseMove}
      className={`absolute inset-0 w-full h-full cursor-crosshair ${className}`}
      preserveAspectRatio="none"
    >
      {Array.from({ length: STRING_COUNT }).map((_, i) => {
        const s = stringsRef.current[i];
        const opacity = s.broken
          ? 0.08 + (Math.abs(s.amplitude) > 1 ? 0.15 : 0)
          : 0.15 + (i / STRING_COUNT) * 0.15 + (Math.abs(s.amplitude) > 1 ? 0.25 : 0);
        const thickness = s.broken ? 1.5 : 2.2 - (i / STRING_COUNT) * 1.2;
        const paths = buildPath(w, h, i);
        return (
          <g key={i}>
            <path d={paths.left} fill="none"
              stroke={s.broken ? `rgba(180,80,60,${opacity})` : `rgba(197,160,89,${opacity})`}
              strokeWidth={thickness} strokeLinecap="round" />
            {paths.right && (
              <path d={paths.right} fill="none"
                stroke={`rgba(180,80,60,${opacity})`}
                strokeWidth={thickness} strokeLinecap="round" />
            )}
          </g>
        );
      })}
      <text x="50%" y="95%" textAnchor="middle"
        className="fill-ayers-gold/15 text-[10px] uppercase tracking-[0.3em]"
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 9 }}>
        slide to pluck
      </text>
    </svg>
  );
}

/* ── Interactive Sun — the 404 centrepiece ── */

function NotFoundSun() {
  const [clicks, setClicks] = useState(0);
  const [hovered, setHovered] = useState(false);

  // Each click triggers a bounce + glow; after 5 clicks spin goes crazy
  const isCrazy = clicks >= 5;
  const spinDuration = isCrazy ? 0.4 : hovered ? 1.5 : 4;

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setClicks((c) => c + 1)}
      whileTap={{ scale: 0.85 }}
      animate={{
        scale: clicks > 0 ? [1, 1.15, 1] : 1,
      }}
      transition={{ duration: 0.4 }}
    >
      {/* Glow ring on click */}
      {clicks > 0 && (
        <motion.div
          key={clicks}
          className="absolute inset-0 -m-6 rounded-full"
          initial={{ opacity: 0.6, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ duration: 0.8 }}
          style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.3) 0%, transparent 70%)' }}
        />
      )}
      <img
        src="/images/ayers/guitar-sun.png"
        alt="Ayers Sun"
        className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_0_40px_rgba(197,160,89,0.25)]"
        style={{
          animation: `spin ${spinDuration}s linear infinite`,
          filter: `contrast(1.3) saturate(${isCrazy ? 1.8 : 1.2}) brightness(${hovered ? 1.15 : 1})`,
        }}
        draggable={false}
      />
      {/* Easter-egg message after 5 clicks */}
      {isCrazy && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-ayers-gold/60 tracking-wider"
        >
          ☀️ You found the secret sun!
        </motion.p>
      )}
    </motion.div>
  );
}

/* ── Main 404 Page ── */

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="bg-ayers-cream min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Interactive broken strings background */}
      <div className="absolute inset-0 z-0">
        <BrokenGuitarStrings />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 relative z-10">
        {/* Sun hero — interactive */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex justify-center"
        >
          <NotFoundSun />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-ayers-gold mb-4">
            {t('notFound.errorCode', 'Error 404')}
          </p>

          <h1 className="text-5xl md:text-7xl font-serif italic font-bold mb-4">
            {t('notFound.title', 'Off Key')}
          </h1>

          <p className="text-lg text-ayers-ink/60 mb-3 leading-relaxed max-w-xl mx-auto">
            {t('notFound.brokenString', '這條弦斷了⋯⋯但我們幫你找到回家的路。')}
          </p>

          <p className="text-sm text-ayers-ink/30 mb-10 max-w-md mx-auto italic">
            {t('notFound.pluckHint', '試著滑過畫面上的弦 — 還有幾條是完好的')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/"
            className="inline-flex items-center bg-ayers-gold text-white px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-ayers-dark transition-all"
          >
            <Home size={16} className="mr-2" />
            {t('notFound.backToHome', 'Back to Home')}
          </Link>
          <Link
            to="/collections"
            className="inline-flex items-center bg-transparent border-2 border-ayers-ink/20 text-ayers-ink px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:border-ayers-gold hover:text-ayers-gold transition-all"
          >
            <PickIcon size={12} className="mr-2" />
            {t('notFound.browseCollections', 'Browse Collections')}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-ayers-gold/30 to-transparent" />
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-ayers-ink/30">
            {t('notFound.tagline', 'Ayers Guitars — Handcrafted Since 1996')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
