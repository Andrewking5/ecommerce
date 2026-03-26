/**
 * Opening — 一張好照片就夠了
 *
 * d08-wave-detail.jpg 佔滿畫面，微慢速放大（Ken Burns）
 * Ayers 品牌字壓在上面
 * 捲動 → 整個畫面往上推走 → Hero 從下方露出
 */
import { useEffect, useRef, useCallback } from 'react';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function SoundHoleTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const acc = useRef(0);
  const done = useRef(false);
  const total = typeof window !== 'undefined' ? window.innerHeight * 0.55 : 550;

  const apply = useCallback((p: number) => {
    const el = ref.current;
    if (!el) return;

    // 整個畫面往上推（像翻頁）
    el.style.transform = `translateY(${-p * 100}vh)`;

    // 圖片繼續微放大
    const img = el.querySelector('[data-img]') as HTMLElement;
    if (img) img.style.transform = `scale(${1.02 + p * 0.08})`;

    // 文字微微上移
    const t = el.querySelector('[data-t]') as HTMLElement;
    if (t) {
      t.style.transform = `translateY(${-p * 30}px)`;
      t.style.opacity = String(clamp(1 - p * 2, 0, 1));
    }

    // Scroll 提示
    const h = el.querySelector('[data-h]') as HTMLElement;
    if (h) h.style.opacity = String(clamp(1 - p * 8, 0, 1));
  }, []);

  const end = useCallback(() => {
    done.current = true;
    document.body.style.overflow = '';
    const el = ref.current;
    if (el) {
      el.style.pointerEvents = 'none';
      setTimeout(() => el.remove(), 200);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const wheel = (e: WheelEvent) => {
      if (done.current) return;
      e.preventDefault();
      acc.current = clamp(acc.current + Math.abs(e.deltaY) * (e.deltaY > 0 ? 1 : -0.3), 0, total);
      requestAnimationFrame(() => { apply(acc.current / total); if (acc.current >= total) end(); });
    };
    let ty = 0;
    const ts = (e: TouchEvent) => { if (!done.current) ty = e.touches[0].clientY; };
    const tm = (e: TouchEvent) => {
      if (done.current) return; e.preventDefault();
      const d = ty - e.touches[0].clientY; ty = e.touches[0].clientY;
      acc.current = clamp(acc.current + d, 0, total);
      requestAnimationFrame(() => { apply(acc.current / total); if (acc.current >= total) end(); });
    };

    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchmove', tm, { passive: false });
    return () => {
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('touchstart', ts);
      window.removeEventListener('touchmove', tm);
      document.body.style.overflow = '';
    };
  }, [apply, end, total]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[9998] will-change-transform"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 照片 — 佔滿整個畫面，慢速 Ken Burns */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          data-img
          src="/images/products/wave/d08-wave-detail.jpg"
          alt=""
          className="w-full h-full object-cover select-none"
          style={{ transform: 'scale(1.02)', animation: 'kb 20s ease-in-out infinite alternate' }}
          draggable={false}
        />
        {/* 暗角 — 讓文字可讀 */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.2) 100%),
            radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.3) 100%)
          `,
        }} />
      </div>

      {/* 品牌文字 — 下方 1/3 */}
      <div
        data-t
        className="absolute bottom-0 left-0 right-0 pb-[15vh] flex flex-col items-center pointer-events-none"
      >
        <h1 className="font-serif italic font-bold text-center leading-none" style={{
          fontSize: 'clamp(3rem, 7vw, 6rem)',
          color: '#F4E7D7',
          letterSpacing: '0.04em',
          textShadow: '0 2px 30px rgba(0,0,0,0.5)',
        }}>
          Ayers
        </h1>
        <div className="mt-4 mb-4" style={{
          width: '40px', height: '1px',
          background: 'rgba(197,160,89,0.5)',
        }} />
        <p className="text-center uppercase" style={{
          fontSize: 'clamp(0.55rem, 1vw, 0.75rem)',
          color: 'rgba(197,160,89,0.6)',
          letterSpacing: '0.5em',
          fontWeight: 300,
        }}>
          Handcrafted Since 1996
        </p>
      </div>

      {/* Scroll 提示 */}
      <div data-h className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-2">
          <div className="w-0.5 h-2 bg-white/30 rounded-full" style={{ animation: 'scroll-dot 1.8s ease-in-out infinite' }} />
        </div>
      </div>

      <style>{`
        @keyframes kb {
          from { transform: scale(1.02); }
          to { transform: scale(1.1); }
        }
        @keyframes scroll-dot {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(6px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
