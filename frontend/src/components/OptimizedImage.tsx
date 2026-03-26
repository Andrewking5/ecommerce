/**
 * OptimizedImage — Drop-in <img> replacement with:
 *   • AVIF → WebP → original fallback via <picture>
 *   • Responsive srcset at 640/960/1280/1920 breakpoints
 *   • Native lazy loading + IntersectionObserver blur-up
 *   • LQIP (Low Quality Image Placeholder) blur effect
 *   • Supports all existing patterns: object-cover/contain, motion, className
 *
 * Usage:
 *   <OptimizedImage src="/images/products/wave/d09-wave-front.png" alt="Guitar" className="w-full h-full object-cover" />
 *
 * External URLs (https://...) and SVGs are passed through as regular <img>.
 */

import { useState, useRef, useEffect, type ImgHTMLAttributes, type CSSProperties } from 'react';

// Import the generated manifest (static import — Vite handles JSON)
import manifestData from '../image-manifest.json';

interface ManifestEntry {
  original: string;
  width: number;
  height: number;
  lqip: string;
  variants: { width: number; webp: string; avif: string }[];
}

const manifest: Record<string, ManifestEntry> = manifestData as Record<string, ManifestEntry>;

/* ── Types ─────────────────────────────────────── */

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Image path (e.g., "/images/products/wave/d09.png") */
  src: string;
  /** Alt text */
  alt?: string;
  /** Sizes hint for responsive images (default: "100vw") */
  sizes?: string;
  /** Disable optimization — render as plain <img> */
  unoptimized?: boolean;
  /** Priority image — skip lazy loading (for above-the-fold) */
  priority?: boolean;
}

/* ── Component ─────────────────────────────────── */

export default function OptimizedImage({
  src,
  alt = '',
  sizes = '100vw',
  className = '',
  style,
  unoptimized = false,
  priority = false,
  ...rest
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, isInView]);

  // Check if this is an external URL, SVG, or data URI — skip optimization
  const isExternal = src.startsWith('http') || src.startsWith('data:');
  const isSvg = src.endsWith('.svg');
  const entry = manifest[src];
  const shouldOptimize = !unoptimized && !isExternal && !isSvg && entry;

  // Plain <img> fallback for external/SVG/unoptimized
  if (!shouldOptimize) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...rest}
      />
    );
  }

  // Build srcset strings
  const webpSrcset = entry.variants
    .map(v => `${v.webp} ${v.width}w`)
    .join(', ');
  const avifSrcset = entry.variants
    .map(v => `${v.avif} ${v.width}w`)
    .join(', ');

  // Fallback to smallest WebP variant
  const fallbackSrc = entry.variants[entry.variants.length - 1]?.webp || src;

  // LQIP blur styles
  const wrapperStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(!isLoaded && entry.lqip
      ? {
          backgroundImage: `url(${entry.lqip})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
      : {}),
  };

  const imgStyle: CSSProperties = {
    transition: 'opacity 0.4s ease, filter 0.4s ease',
    opacity: isLoaded ? 1 : 0,
    filter: isLoaded ? 'none' : 'blur(20px)',
    ...style,
  };

  // Aspect ratio for CLS prevention
  const aspectRatio = entry.width && entry.height
    ? `${entry.width} / ${entry.height}`
    : undefined;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...wrapperStyle,
        aspectRatio: !isLoaded ? aspectRatio : undefined,
      }}
    >
      {isInView && (
        <picture>
          <source type="image/avif" srcSet={avifSrcset} sizes={sizes} />
          <source type="image/webp" srcSet={webpSrcset} sizes={sizes} />
          <img
            src={fallbackSrc}
            alt={alt}
            width={entry.width}
            height={entry.height}
            className="w-full h-full"
            style={imgStyle}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={() => setIsLoaded(true)}
            draggable={rest.draggable}
            referrerPolicy={rest.referrerPolicy}
          />
        </picture>
      )}
    </div>
  );
}
