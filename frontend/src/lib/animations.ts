import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

// ---------------------------------------------------------------------------
// Plugin Registration
// ---------------------------------------------------------------------------

let scrollTriggerRegistered = false;

/**
 * Register the GSAP ScrollTrigger plugin (safe to call multiple times).
 */
export function registerScrollAnimations(): void {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

// ---------------------------------------------------------------------------
// Smooth Scroll (Lenis + GSAP ticker)
// ---------------------------------------------------------------------------

let lenisInstance: Lenis | null = null;

/**
 * Initialise Lenis smooth-scroll and wire it into the GSAP ticker so
 * ScrollTrigger stays in sync.
 *
 * Returns the Lenis instance so it can be destroyed on cleanup.
 */
export function initSmoothScroll(options?: {
  duration?: number;
  easing?: (t: number) => number;
  orientation?: 'vertical' | 'horizontal';
  smoothWheel?: boolean;
  syncTouch?: boolean;
}): Lenis {
  registerScrollAnimations();

  if (lenisInstance) {
    lenisInstance.destroy();
  }

  const lenis = new Lenis({
    duration: options?.duration ?? 1.2,
    easing: options?.easing ?? ((t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
    orientation: options?.orientation ?? 'vertical',
    smoothWheel: options?.smoothWheel ?? true,
    syncTouch: options?.syncTouch ?? false,
  });

  // Pipe Lenis scroll values into ScrollTrigger on every GSAP tick
  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Keep ScrollTrigger updated when Lenis scrolls
  lenis.on('scroll', ScrollTrigger.update);

  lenisInstance = lenis;
  return lenis;
}

// ---------------------------------------------------------------------------
// Text Reveal (split by words / lines)
// ---------------------------------------------------------------------------

export interface SplitTextRevealOptions {
  /** 'words' wraps each word, 'lines' wraps each line. Default: 'words' */
  splitBy?: 'words' | 'lines';
  /** Stagger time between each element in seconds. Default: 0.05 */
  stagger?: number;
  /** Total animation duration per element. Default: 0.8 */
  duration?: number;
  /** Y offset in px for the reveal. Default: 40 */
  yOffset?: number;
  /** ScrollTrigger start position. Default: 'top 85%' */
  start?: string;
  /** Extra GSAP vars merged into the tween. */
  gsapVars?: gsap.TweenVars;
}

/**
 * Split text content of element(s) matched by `selector` into spans
 * (per-word or per-line) and animate them in with a staggered reveal.
 *
 * Returns the GSAP timeline for further chaining / control.
 */
export function splitTextReveal(
  selector: string | HTMLElement,
  options: SplitTextRevealOptions = {},
): gsap.core.Timeline {
  registerScrollAnimations();

  const {
    splitBy = 'words',
    stagger = 0.05,
    duration = 0.8,
    yOffset = 40,
    start = 'top 85%',
    gsapVars = {},
  } = options;

  const elements =
    typeof selector === 'string'
      ? Array.from(document.querySelectorAll<HTMLElement>(selector))
      : [selector];

  const tl = gsap.timeline();

  elements.forEach((el) => {
    const originalText = el.textContent ?? '';
    el.style.overflow = 'hidden';

    let spans: HTMLSpanElement[];

    if (splitBy === 'words') {
      const words = originalText.split(/\s+/).filter(Boolean);
      el.innerHTML = '';
      spans = words.map((word, i) => {
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.style.overflow = 'hidden';
        span.textContent = word;
        el.appendChild(span);
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
        return span;
      });
    } else {
      // 'lines' – approximate by wrapping each <br>-delimited segment
      const lines = originalText.split('\n').filter(Boolean);
      el.innerHTML = '';
      spans = lines.map((line) => {
        const span = document.createElement('span');
        span.style.display = 'block';
        span.style.overflow = 'hidden';

        const inner = document.createElement('span');
        inner.style.display = 'block';
        inner.textContent = line;
        span.appendChild(inner);
        el.appendChild(span);
        return inner;
      });
    }

    gsap.set(spans, { y: yOffset, opacity: 0 });

    tl.to(spans, {
      y: 0,
      opacity: 1,
      duration,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
      },
      ...gsapVars,
    });
  });

  return tl;
}

// ---------------------------------------------------------------------------
// Parallax Image
// ---------------------------------------------------------------------------

export interface ParallaxImageOptions {
  /** Parallax speed multiplier. Default: 0.3 */
  speed?: number;
  /** ScrollTrigger start position. Default: 'top bottom' */
  start?: string;
  /** ScrollTrigger end position. Default: 'bottom top' */
  end?: string;
}

/**
 * Apply a vertical parallax effect to an image element.
 * The element's parent should have `overflow: hidden` for best results.
 *
 * Returns the ScrollTrigger instance for cleanup.
 */
export function parallaxImage(
  element: HTMLElement,
  options: ParallaxImageOptions = {},
): ScrollTrigger {
  registerScrollAnimations();

  const { speed = 0.3, start = 'top bottom', end = 'bottom top' } = options;

  // Scale up slightly so the parallax shift doesn't expose gaps
  gsap.set(element, { scale: 1 + speed, willChange: 'transform' });

  const yPercent = speed * 100;

  const tween = gsap.fromTo(
    element,
    { yPercent: -yPercent / 2 },
    {
      yPercent: yPercent / 2,
      ease: 'none',
      scrollTrigger: {
        trigger: element.parentElement ?? element,
        start,
        end,
        scrub: true,
      },
    },
  );

  return (tween as gsap.core.Tween).scrollTrigger!;
}

// ---------------------------------------------------------------------------
// Magnetic Button
// ---------------------------------------------------------------------------

export interface MagneticButtonOptions {
  /** How strongly the element follows the cursor (0-1). Default: 0.3 */
  strength?: number;
  /** Ease duration when returning to centre. Default: 0.6 */
  ease?: number;
}

/**
 * Add a magnetic effect to an element so it subtly follows the cursor
 * when hovered.
 *
 * Returns a cleanup function that removes event listeners.
 */
export function magneticButton(
  element: HTMLElement,
  options: MagneticButtonOptions = {},
): () => void {
  const { strength = 0.3, ease = 0.6 } = options;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    gsap.to(element, {
      x: deltaX,
      y: deltaY,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: ease,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
    gsap.set(element, { x: 0, y: 0 });
  };
}

// ---------------------------------------------------------------------------
// Scroll Reveal
// ---------------------------------------------------------------------------

export type RevealPreset = 'fade-up' | 'fade-down' | 'slide-left' | 'slide-right' | 'scale';

export interface ScrollRevealOptions {
  /** Animation preset. Default: 'fade-up' */
  preset?: RevealPreset;
  /** Duration in seconds. Default: 1 */
  duration?: number;
  /** Delay in seconds. Default: 0 */
  delay?: number;
  /** ScrollTrigger start. Default: 'top 85%' */
  start?: string;
  /** Distance in px for translate presets. Default: 60 */
  distance?: number;
  /** Extra GSAP vars merged into the "from" state. */
  gsapVars?: gsap.TweenVars;
}

/**
 * Trigger a reveal animation on the given element when it enters the
 * viewport. Common presets cover the majority of Awwwards-style reveals.
 *
 * Returns the GSAP tween for further control.
 */
export function scrollReveal(
  element: HTMLElement,
  options: ScrollRevealOptions = {},
): gsap.core.Tween {
  registerScrollAnimations();

  const {
    preset = 'fade-up',
    duration = 1,
    delay = 0,
    start = 'top 85%',
    distance = 60,
    gsapVars = {},
  } = options;

  const fromVars: gsap.TweenVars = { opacity: 0 };

  switch (preset) {
    case 'fade-up':
      fromVars.y = distance;
      break;
    case 'fade-down':
      fromVars.y = -distance;
      break;
    case 'slide-left':
      fromVars.x = distance;
      break;
    case 'slide-right':
      fromVars.x = -distance;
      break;
    case 'scale':
      fromVars.scale = 0.85;
      break;
  }

  return gsap.from(element, {
    ...fromVars,
    ...gsapVars,
    duration,
    delay,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start,
      toggleActions: 'play none none none',
    },
  }) as gsap.core.Tween;
}
