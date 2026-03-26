/**
 * CustomCursor — A premium custom cursor for the Ayers Guitars website.
 *
 * Features:
 *   - Gold inner dot (8px) that tracks the mouse exactly
 *   - Outer ring (40px) that follows with eased interpolation (lerp)
 *   - Context-aware states: scale-up on interactive elements, text labels on images/drag zones
 *   - Hides automatically on touch-only devices
 *   - Uses GPU-accelerated transforms and requestAnimationFrame
 *
 * Usage:
 *   Place <CustomCursor /> as a direct child of the root wrapper in App.tsx,
 *   e.g. right after the opening <div> inside <Router>.
 */

import { useEffect, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOT_SIZE = 8;
const RING_SIZE = 40;
const LERP_SPEED = 0.15; // 0 = no movement, 1 = instant
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, label, [data-cursor="pointer"]';
const VIEW_SELECTOR = 'img, video, picture, [data-cursor="view"]';
const DRAG_SELECTOR = '[data-cursor="drag"]';

// ---------------------------------------------------------------------------
// Style sheet (injected once)
// ---------------------------------------------------------------------------

const CURSOR_STYLES = `
/* Hide default cursor on devices that support hover (non-touch) */
@media (hover: hover) and (pointer: fine) {
  html.custom-cursor-active,
  html.custom-cursor-active * {
    cursor: none !important;
  }
}
`;

let stylesInjected = false;

function injectStyles(): void {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.setAttribute('data-custom-cursor', '');
  style.textContent = CURSOR_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

function removeStyles(): void {
  const el = document.querySelector('style[data-custom-cursor]');
  if (el) el.remove();
  stylesInjected = false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Walk up from target to see if any ancestor matches `selector`. */
function closestMatch(target: EventTarget | null, selector: string): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest(selector) !== null;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CursorState = 'default' | 'pointer' | 'view' | 'drag';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Mutable refs for animation state (avoids re-renders)
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const state = useRef<CursorState>('default');
  const visible = useRef(false);
  const rafId = useRef<number>(0);

  // --------------------------------------------------
  // Determine whether we should even mount the cursor
  // --------------------------------------------------
  const isHoverDevice = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  useEffect(() => {
    // Bail out entirely on touch-only devices
    if (!isHoverDevice()) return;

    injectStyles();
    document.documentElement.classList.add('custom-cursor-active');

    const dot = dotRef.current;
    const ringEl = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ringEl || !label) return;

    // ------- Event handlers -------

    function onMouseMove(e: MouseEvent) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!visible.current) {
        visible.current = true;
        dot!.style.opacity = '1';
        ringEl!.style.opacity = '1';
      }

      // Determine cursor state from target
      const target = e.target;
      if (closestMatch(target, DRAG_SELECTOR)) {
        setState('drag');
      } else if (closestMatch(target, VIEW_SELECTOR)) {
        setState('view');
      } else if (closestMatch(target, INTERACTIVE_SELECTOR)) {
        setState('pointer');
      } else {
        setState('default');
      }
    }

    function onMouseLeave() {
      visible.current = false;
      dot!.style.opacity = '0';
      ringEl!.style.opacity = '0';
    }

    function onMouseDown() {
      ringEl!.style.transform = getRingTransform(0.85);
    }

    function onMouseUp() {
      ringEl!.style.transform = getRingTransform(1);
    }

    function setState(next: CursorState) {
      if (state.current === next) return;
      state.current = next;
      applyState();
    }

    function applyState() {
      const s = state.current;

      // Ring scale & size
      switch (s) {
        case 'pointer':
          ringEl!.style.width = `${RING_SIZE}px`;
          ringEl!.style.height = `${RING_SIZE}px`;
          ringEl!.style.borderColor = 'rgba(197, 160, 89, 0.6)';
          ringEl!.style.backgroundColor = 'rgba(197, 160, 89, 0.08)';
          ringEl!.style.transform = getRingTransform(1.5);
          label!.textContent = '';
          label!.style.opacity = '0';
          break;
        case 'view':
          ringEl!.style.width = '72px';
          ringEl!.style.height = '72px';
          ringEl!.style.borderColor = 'rgba(197, 160, 89, 0.8)';
          ringEl!.style.backgroundColor = 'rgba(197, 160, 89, 0.12)';
          ringEl!.style.transform = getRingTransform(1);
          label!.textContent = 'View';
          label!.style.opacity = '1';
          break;
        case 'drag':
          ringEl!.style.width = '72px';
          ringEl!.style.height = '72px';
          ringEl!.style.borderColor = 'rgba(197, 160, 89, 0.8)';
          ringEl!.style.backgroundColor = 'rgba(197, 160, 89, 0.12)';
          ringEl!.style.transform = getRingTransform(1);
          label!.textContent = 'Drag';
          label!.style.opacity = '1';
          break;
        default:
          ringEl!.style.width = `${RING_SIZE}px`;
          ringEl!.style.height = `${RING_SIZE}px`;
          ringEl!.style.borderColor = 'rgba(197, 160, 89, 0.35)';
          ringEl!.style.backgroundColor = 'transparent';
          ringEl!.style.transform = getRingTransform(1);
          label!.textContent = '';
          label!.style.opacity = '0';
      }
    }

    function getRingTransform(extraScale: number = 1): string {
      const x = ring.current.x;
      const y = ring.current.y;
      // The ring is centered via negative margin equal to half its current size,
      // but since the size can change we use translate(-50%, -50%) in base styles.
      return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${extraScale})`;
    }

    // ------- Animation loop -------

    function animate() {
      // Move dot instantly
      if (dot) {
        dot.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Ease the ring toward mouse
      ring.current.x = lerp(ring.current.x, mouse.current.x, LERP_SPEED);
      ring.current.y = lerp(ring.current.y, mouse.current.y, LERP_SPEED);

      if (ringEl) {
        const s = state.current;
        const scale = s === 'pointer' ? 1.5 : 1;
        ringEl.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }

      rafId.current = requestAnimationFrame(animate);
    }

    // ------- Bind events -------

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    rafId.current = requestAnimationFrame(animate);

    // ------- Cleanup -------

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafId.current);
      document.documentElement.classList.remove('custom-cursor-active');
      removeStyles();
    };
  }, [isHoverDevice]);

  // Don't render anything on touch-only (SSR-safe: always render the DOM,
  // but the useEffect simply won't activate the behaviour).
  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: '50%',
          backgroundColor: '#C5A059',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0,
          mixBlendMode: 'difference',
          transition: 'opacity 0.3s ease, width 0.3s ease, height 0.3s ease',
          willChange: 'transform',
        }}
      />

      {/* Outer ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: RING_SIZE,
          height: RING_SIZE,
          borderRadius: '50%',
          border: '1.5px solid rgba(197, 160, 89, 0.35)',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0,
          transition: 'opacity 0.3s ease, width 0.35s ease, height 0.35s ease, border-color 0.3s ease, background-color 0.3s ease',
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Label text (View / Drag) */}
        <span
          ref={labelRef}
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#C5A059',
            opacity: 0,
            transition: 'opacity 0.25s ease',
            userSelect: 'none',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        />
      </div>
    </>
  );
}
