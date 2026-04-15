import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'motion/react';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import bannerService from '../services/bannerService';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import GuitarStrings from '../components/animations/GuitarStrings';
import SunwaveRipple from '../components/animations/SunwaveRipple';
import FretboardProgress from '../components/animations/FretboardProgress';
import StringPluck from '../components/animations/StringPluck';
import {
  Rosette, PickIcon, StringDivider, GlowingCard,
  WordMaskReveal, OdometerCounter, GuitarSunLoader,
} from '../components/guitar';
import { AyersLogo } from '../components/AyersLogo';

/* ─────────── CONSTANTS ─────────── */

const ESPRESSO = '#402512';
const ESPRESSO_DARK = '#2a1a0e';
const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FRETBOARD_SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'series', label: 'Series' },
  { id: 'featured', label: 'Featured' },
  { id: 'technology', label: 'Technology' },
  { id: 'uluru', label: 'Uluru' },
  { id: 'customizer', label: 'Customizer' },
  { id: 'stats', label: 'Stats' },
];

/* ─────────────────────────── HERO SLIDES ─────────────────────────── */

const FALLBACK_SLIDES = [
  {
    id: 'brand',
    subtitle: 'home.heroSubtitle',
    title: ['Ayers', 'Guitars'],
    titleColors: ['text-ayers-warm-cream', 'text-ayers-gold'],
    body: 'home.heroBody',
    cta: { label: 'home.heroCTA', link: '/collections' },
    img: '/images/products/wave/d09-wave-front.png',
  },
  {
    id: 'wave',
    subtitle: 'home.waveSeriesLabel',
    title: ['Wave', 'Series'],
    titleColors: ['text-ayers-gold', 'text-ayers-warm-cream'],
    body: 'home.waveDesc',
    cta: { label: 'home.viewSeries', link: '/collections?series=wave' },
    img: '/images/products/wave/a05c-wave-front.png',
  },
  {
    id: 'sun',
    subtitle: 'home.sunSeriesLabel',
    title: ['Sun', 'Series'],
    titleColors: ['text-ayers-gold', 'text-ayers-warm-cream'],
    body: 'home.sunDesc',
    cta: { label: 'home.viewSeries', link: '/collections?series=sun' },
    img: '/images/products/sun/sj07c-passion-front.png',
  },
  {
    id: 'custom',
    subtitle: 'home.customizerLabel',
    title: ['Custom', 'Workshop'],
    titleColors: ['text-ayers-warm-cream', 'text-ayers-gold'],
    body: 'home.customizerBody',
    cta: { label: 'home.customizerCTA', link: '/customizer' },
    img: '/images/products/light/st2-ocean-1.png',
  },
];

const SLIDE_INTERVAL = 6000;

/* ─────────────────────────── DATA ─────────────────────────── */

/*
 * Alternating editorial layout — oversized number watermark + floating guitar
 * Odd series: guitar left, text right
 * Even series: text left, guitar right
 */
const SERIES = [
  {
    name: 'SUN',
    fullName: 'SUN 日系列',
    subtitle: '溫暖 · 共鳴 · 經典',
    descKey: 'home.sunDesc',
    img: '/images/products/sun/sj07c-passion-front.png',
    detail: '/images/products/sun/ac-ep-soundhole.png',
    link: '/collections?series=sun',
    number: '01',
    models: 8,
  },
  {
    name: 'WAVE',
    fullName: 'WAVE 濤系列',
    subtitle: '力量 · 動態 · 澎湃',
    descKey: 'home.waveDesc',
    img: '/images/products/wave/a05c-wave-front.png',
    detail: '/images/products/wave/d08-wave-soundhole.jpg',
    link: '/collections?series=wave',
    number: '02',
    models: 12,
  },
  {
    name: 'LIGHT',
    fullName: 'LIGHT 光系列',
    subtitle: '清透 · 輕盈 · 靈動',
    descKey: 'home.lightDesc',
    img: '/images/products/light/st2-ocean-1.png',
    detail: '/images/products/light/st2-ocean-bridge.png',
    link: '/collections?series=light',
    number: '03',
    models: 10,
  },
  {
    name: 'MASTER',
    fullName: 'MASTER 大師系列',
    subtitle: '極致 · 頂級 · 收藏',
    descKey: 'home.masterDesc',
    img: '/images/products/sun/a17c-sun-front.jpg',
    detail: '/images/products/sun/ac-ep-cutaway-detail.png',
    link: '/collections?series=master',
    number: '04',
    models: 3,
  },
  {
    name: 'VINTAGE',
    fullName: 'Vintage 經典系列',
    subtitle: '復古 · 韻味 · 傳承',
    descKey: 'home.vintageDesc',
    img: '/images/products/wave/ay25-front.png',
    detail: '/images/products/wave/ay25-detail.jpg',
    link: '/collections?series=vintage',
    number: '05',
    models: 4,
  },
  {
    name: 'ULURU',
    fullName: 'Uluru 烏克麗麗系列',
    subtitle: '小巧 · 歡快 · 旅行',
    descKey: 'home.ukuleleDesc',
    img: '/images/products/uluru/manako-iii-front.png',
    detail: '/images/products/uluru/manako-iii-detail.png',
    link: '/collections?series=ukulele',
    number: '06',
    models: 5,
  },
];

const FOUNDING_YEAR = 1996;
const STATS = [
  { labelKey: 'home.statYears', value: new Date().getFullYear() - FOUNDING_YEAR, suffix: '+' },
  { labelKey: 'home.statModels', value: 70, suffix: '+' },
  { labelKey: 'home.statCountries', value: 20, suffix: '+' },
];

/* ── Time-sensitive greeting ── */
function getTimeGreetingKey(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Brand anniversary: Ayers founded 1996 — celebrate in founding month
  // (using a broad date range; adjust to actual anniversary date if known)
  if (month === 10 && day >= 1 && day <= 7) {
    return 'home.greetAnniversary';
  }
  // Lunar New Year window (rough: late Jan–mid Feb)
  if ((month === 1 && day >= 20) || (month === 2 && day <= 15)) {
    return 'home.greetNewYear';
  }
  // Christmas
  if (month === 12 && day >= 20 && day <= 26) {
    return 'home.greetChristmas';
  }

  const hour = now.getHours();
  if (hour >= 0 && hour < 5) return 'home.greetLateNight';
  if (hour >= 5 && hour < 9) return 'home.greetMorning';
  if (hour >= 9 && hour < 12) return 'home.greetForenoon';
  if (hour >= 12 && hour < 14) return 'home.greetNoon';
  if (hour >= 14 && hour < 18) return 'home.greetAfternoon';
  if (hour >= 18 && hour < 22) return 'home.greetEvening';
  return 'home.greetLateNight';
}

/* ─────────────────────── MAIN PAGE ────────────────────────── */

export default function Home() {
  const { t } = useTranslation();

  /* Hero slides — fetch from API, fall back to static data */
  const [heroSlides, setHeroSlides] = useState(FALLBACK_SLIDES);

  useEffect(() => {
    bannerService.getActiveBanners('home')
      .then(banners => {
        if (banners.length > 0) {
          setHeroSlides(banners.map(b => ({
            id: b.slug,
            subtitle: b.subtitle,
            title: [b.titleWord1, b.titleWord2],
            titleColors: [b.titleColor1, b.titleColor2],
            body: b.body,
            cta: { label: b.ctaLabel, link: b.ctaLink },
            img: b.image,
          })));
        }
      })
      .catch(() => {}); // keep fallback
  }, []);

  /* Hero billboard carousel */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setSlideDirection] = useState(1);

  // Auto-rotate slides（移除 currentSlide 依賴，避免每次換 slide 重建 timer）
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideDirection(1);
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const goToSlide = useCallback((idx: number) => {
    setSlideDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  }, [currentSlide]);

  /* Tech section */
  const techImageRef = useRef<HTMLDivElement>(null);
  const techIsInView = useInView(techImageRef, { once: true, margin: '-100px' });

  /* Series expand removed — using hover reveal instead */

  /* (carousel drag removed — featured merged into series) */

  /* ── Page entrance ── */
  const [entered, setEntered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setEntered(true), 200); return () => clearTimeout(t); }, []);

  return (
    <motion.div
      className="bg-ayers-cream overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: entered ? 1 : 0 }}
      transition={{ duration: 0.6 }}
    >
      <SEO
        title={t('home.seoTitle', '手工吉他品牌 — 台灣製造頂級原聲吉他')}
        description={t('home.seoDesc', 'Ayers Guitars — 自1996年起，以匠心手工打造頂級原聲吉他。SUNWAVE 聲學技術，為您帶來卓越音色與共鳴。')}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Ayers Guitars',
          url: 'https://www.ayersguitars.com',
          logo: 'https://www.ayersguitars.com/favicon.svg',
          foundingDate: '1996',
          foundingLocation: { '@type': 'Place', name: 'Taiwan' },
          description: 'Premium handcrafted acoustic guitars from Taiwan since 1996.',
          sameAs: [
            'https://www.facebook.com/AyersgtUluruuke',
            'https://www.instagram.com/ayersguitar/',
            'https://www.youtube.com/user/AyersGuitar',
          ],
        }}
      />
      <FretboardProgress sections={FRETBOARD_SECTIONS} />

      {/* ── Social sidebar (fixed right, desktop only) ──────────────── */}
      <div className="fixed right-5 bottom-8 z-40 hidden lg:flex flex-col gap-3">
        {[
          { href: 'https://www.facebook.com/AyersgtUluruuke', icon: 'facebook', label: 'Facebook' },
          { href: 'https://line.me/R/ti/p/@868lgkhc', icon: 'line', label: 'LINE' },
          { href: 'https://www.instagram.com/ayersguitar/', icon: 'instagram', label: 'Instagram' },
          { href: 'https://www.youtube.com/user/AyersGuitar', icon: 'youtube', label: 'YouTube' },
        ].map(s => (
          <a
            key={s.icon}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="w-10 h-10 rounded-lg bg-ayers-espresso/80 backdrop-blur-md border border-ayers-espresso/20 shadow-lg flex items-center justify-center text-white/70 hover:text-ayers-gold hover:bg-ayers-espresso hover:border-ayers-gold/30 hover:scale-110 transition-all duration-300"
          >
            {s.icon === 'facebook' && <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
            {s.icon === 'line' && <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>}
            {s.icon === 'instagram' && <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>}
            {s.icon === 'youtube' && <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>}
          </a>
        ))}
      </div>

{/* Opening animation removed — Hero IS the first impression */}

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Full-screen Billboard Carousel
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="hero" ref={heroRef}
        className="relative h-screen overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${ESPRESSO} 0%, ${ESPRESSO_DARK} 60%, ${ESPRESSO} 100%)` }}
      >
        {/* ── Static ambient glow ── */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[60vw] sm:w-[500px] h-[60vw] sm:h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.06) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/3 left-1/4 w-[45vw] sm:w-[350px] h-[45vw] sm:h-[350px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.04) 0%, transparent 70%)' }} />
        </div>

        {/* Grain */}
        <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.06] mix-blend-overlay bg-noise" />

        {/* Guitar strings — subtle background texture */}
        <GuitarStrings play className="z-[3] opacity-20" />

        {/* Rosette — 使用 CSS animation 取代 motion 以降低 JS 開銷 */}
        <div
          className="absolute bottom-20 right-12 lg:right-28 z-[4] text-ayers-gold/15 pointer-events-none hidden md:block"
          style={{ animation: 'spin 40s linear infinite' }}
        >
          <Rosette size={160} />
        </div>

        {/* ── Time-sensitive greeting pill (top-left, fades in) ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="absolute top-8 left-6 sm:left-10 lg:left-16 z-20"
        >
          <span className="inline-flex items-center gap-2 text-sm sm:text-base text-ayers-warm-cream/50 tracking-widest font-light">
            <span className="text-ayers-gold/70 text-lg">&#9834;</span>
            {t(getTimeGreetingKey())}
          </span>
        </motion.div>

        {/* ── Slide content ── */}
        <motion.div className="relative z-10 h-full flex items-center" style={{ opacity: heroOpacity }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                className="max-w-xl lg:max-w-2xl"
              >
                {/* Subtitle */}
                <p className="flex items-center gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.5em] text-ayers-gold mb-6 sm:mb-8">
                  <PickIcon size={10} className="opacity-60" />
                  {t(heroSlides[currentSlide].subtitle)}
                </p>

                {/* Title — use animated SVG logo for the brand slide */}
                {heroSlides[currentSlide].id === 'brand' ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 sm:mb-8"
                  >
                    <AyersLogo className="w-[280px] sm:w-[400px] md:w-[500px] lg:w-[600px] text-ayers-warm-cream" duration={2} delay={0.3} />
                  </motion.div>
                ) : (
                  <h1 className="text-5xl sm:text-7xl md:text-[7rem] lg:text-[9rem] font-serif italic font-bold leading-[0.9] mb-6 sm:mb-8">
                    {heroSlides[currentSlide].title.map((word, wi) => (
                      <motion.span
                        key={wi}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: wi * 0.15, ease: EASE_OUT_EXPO }}
                        className={`block ${heroSlides[currentSlide].titleColors[wi]} ${wi === 1 ? 'ml-4 sm:ml-12' : ''}`}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </h1>
                )}

                {/* Body */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-sm sm:text-base lg:text-lg text-ayers-warm-cream/55 font-light leading-relaxed max-w-lg mb-10"
                >
                  {t(heroSlides[currentSlide].body)}
                </motion.p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Link to={heroSlides[currentSlide].cta.link}>
                    <motion.span
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-2 bg-ayers-gold text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors hover:bg-ayers-warm-cream hover:text-ayers-espresso"
                    >
                      <PickIcon size={11} />
                      {t(heroSlides[currentSlide].cta.label)}
                    </motion.span>
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Product guitar — mobile: top center, desktop: right side */}
        {/* Mobile version */}
        <div className="absolute top-6 right-4 z-[8] lg:hidden pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.img
              key={`guitar-m-${currentSlide}`}
              src={heroSlides[currentSlide].img}
              alt=""
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.35, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
              className="h-[35vh] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              draggable={false}
            />
          </AnimatePresence>
        </div>

        {/* Desktop version */}
        <div className="absolute right-[3%] xl:right-[8%] top-1/2 -translate-y-1/2 z-[8] hidden lg:flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={`guitar-d-${currentSlide}`}
              initial={{ opacity: 0, y: 40, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -30, rotate: -2 }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
              className="relative"
            >
              <div className="absolute inset-0 -m-16 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(197,160,89,0.12) 0%, transparent 70%)' }} />
              <OptimizedImage
                src={heroSlides[currentSlide].img}
                alt=""
                className="h-[60vh] xl:h-[68vh] object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative z-10"
                draggable={false}
                priority
                sizes="(min-width: 1280px) 40vw, 30vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Slide indicators — bottom center ── */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="relative group p-1"
            >
              {/* Track */}
              <div className="w-8 sm:w-12 h-[2px] bg-ayers-warm-cream/15 rounded-full overflow-hidden">
                {/* Progress fill */}
                {currentSlide === i ? (
                  <motion.div
                    className="h-full bg-ayers-gold rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: SLIDE_INTERVAL / 1000, ease: 'linear' }}
                  />
                ) : (
                  <div className={`h-full rounded-full transition-all duration-300 ${
                    i < currentSlide ? 'bg-ayers-gold/40 w-full' : 'bg-transparent w-0'
                  }`} />
                )}
              </div>
              {/* Label on hover */}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest text-ayers-warm-cream/0 group-hover:text-ayers-warm-cream/50 transition-colors whitespace-nowrap">
                {String(i + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>

        {/* Scroll hint — bottom right: spinning guitar sun */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 right-6 sm:right-10 z-10 flex items-center gap-3 pointer-events-none"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] text-ayers-warm-cream/20 font-medium hidden sm:block">{t('home.scroll')}</span>
          <GuitarSunLoader size={56} speed="slow" opacity={0.35} />
        </motion.div>

        {/* Slide counter — top right */}
        <div className="absolute top-8 right-6 sm:right-10 lg:right-16 z-20 flex items-baseline gap-1.5">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentSlide}
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-mono font-bold text-ayers-warm-cream/60"
            >
              {String(currentSlide + 1).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
          <span className="text-xs font-mono text-ayers-warm-cream/20">/&nbsp;{String(heroSlides.length).padStart(2, '0')}</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. MARQUEE
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ background: `linear-gradient(135deg, ${ESPRESSO}, ${ESPRESSO_DARK})` }} className="overflow-hidden">
        <StringDivider className="opacity-30" />
        <div className="py-4">
          <div className="flex whitespace-nowrap">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="flex-shrink-0 text-[10px] sm:text-xs uppercase tracking-[0.35em] text-ayers-warm-cream/12 font-semibold will-change-transform"
                style={{ animation: 'marquee 25s linear infinite' }}
              >
                {t('home.marquee')}{t('home.marquee')}
              </span>
            ))}
          </div>
        </div>
        <StringDivider className="opacity-30" />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. SERIES SHOWCASE — Alternating editorial + oversized number
          ═══════════════════════════════════════════════════════════ */}
      <section id="series" className="py-24 sm:py-32 bg-ayers-cream overflow-hidden">
        {/* Section header */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="mb-8 sm:mb-12"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-ayers-gold mb-4">
              {t('home.seriesLabel')}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold">
              {t('home.seriesTitle')}
            </h2>
          </motion.div>
        </div>

        {/* Series list — alternating layout */}
        <div className="space-y-0">
          {SERIES.map((series, i) => {
            const isEven = i % 2 === 1;
            return (
              <Link
                key={series.name}
                to={series.link}
                className="group block relative overflow-hidden"
              >
                {/* Full-width row container */}
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative py-16 sm:py-20 md:py-24 lg:py-28">

                  {/* ── Oversized number watermark ── */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 1, ease: EASE_OUT_EXPO }}
                    className={`absolute top-1/2 -translate-y-1/2 select-none pointer-events-none z-0
                      text-[clamp(12rem,28vw,22rem)] font-serif italic font-black leading-none
                      text-transparent
                      ${isEven ? 'right-[5%] md:right-[8%]' : 'left-[5%] md:left-[8%]'}`}
                    style={{
                      WebkitTextStroke: '1.5px rgba(180,160,130,0.12)',
                    }}
                  >
                    {series.number}
                  </motion.span>

                  {/* ── Detail image — small floating accent ── */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 0.35, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    className={`hidden lg:block absolute top-1/2 -translate-y-1/2 z-0
                      w-28 h-28 rounded-full overflow-hidden
                      ${isEven ? 'left-[12%]' : 'right-[12%]'}`}
                  >
                    <OptimizedImage
                      src={series.detail}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      draggable={false}
                      sizes="112px"
                    />
                  </motion.div>

                  {/* ── Main content grid: guitar + text ── */}
                  <div className={`relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center`}>
                    {/* Guitar image side */}
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
                      className={`relative flex items-center justify-center ${isEven ? 'md:order-2' : ''}`}
                    >
                      <div className="relative w-full max-w-sm md:max-w-md mx-auto">
                        {/* Subtle ground shadow */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/[0.06] rounded-[100%] blur-xl" />
                        <OptimizedImage
                          src={series.img}
                          alt={series.fullName}
                          className="w-full h-auto object-contain drop-shadow-2xl
                            group-hover:scale-[1.04] group-hover:-translate-y-2
                            transition-all duration-700 ease-out"
                          draggable={false}
                          sizes="(min-width: 768px) 40vw, 90vw"
                        />
                      </div>
                    </motion.div>

                    {/* Text side */}
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT_EXPO }}
                      className={isEven ? 'md:order-1' : ''}
                    >
                      {/* Series label */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-ayers-gold">
                          {t('home.seriesNumber', 'Series')} {series.number}
                        </span>
                        <div className="h-px flex-1 max-w-[3rem] bg-ayers-gold/30" />
                        <span className="text-[10px] font-medium tracking-wider text-ayers-ink/30">
                          {series.models} {t('home.modelsCount', 'Models')}
                        </span>
                      </div>

                      {/* Series name */}
                      <h3 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-serif italic font-bold leading-[1.1] mb-2
                        group-hover:text-ayers-gold transition-colors duration-500">
                        {series.fullName}
                      </h3>

                      {/* Subtitle / tagline */}
                      <p className="text-xs sm:text-sm tracking-[0.3em] text-ayers-ink/35 mb-5 font-light">
                        {series.subtitle}
                      </p>

                      {/* Divider */}
                      <div className="w-10 h-[1.5px] bg-ayers-gold/40 mb-5 group-hover:w-16 transition-all duration-500" />

                      {/* Description */}
                      <p className="text-sm sm:text-base text-ayers-ink/50 leading-relaxed mb-8 max-w-md
                        group-hover:text-ayers-ink/70 transition-colors duration-500">
                        {t(series.descKey)}
                      </p>

                      {/* CTA */}
                      <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em]
                        text-ayers-ink/60 group-hover:text-ayers-gold transition-all duration-500">
                        {t('home.viewSeries')}
                        <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Subtle top border between series */}
                {i > 0 && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] max-w-3xl h-px bg-gradient-to-r from-transparent via-ayers-gold/15 to-transparent" />
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. TECHNOLOGY
          ═══════════════════════════════════════════════════════════ */}
      <section id="technology" className="py-24 sm:py-32 bg-ayers-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-ayers-gold mb-6">
                {t('home.techLabel')}
              </p>
              <WordMaskReveal text="Ayers" as="h2" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic font-bold leading-none mb-2" />
              <WordMaskReveal text="2.0" as="h2" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic font-bold leading-none text-ayers-gold mb-8" delay={0.25} />
              <div className="w-16 h-[2px] bg-ayers-gold/40 mb-8" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-ayers-ink/45 mb-4">{t('home.techSubtitle')}</p>
              <p className="text-sm sm:text-base md:text-lg text-ayers-ink/60 leading-relaxed mb-10 max-w-md">{t('home.techBody')}</p>
              <Link to="/technology" className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest hover:text-ayers-gold transition-colors">
                <span className="border-b-2 border-ayers-gold pb-1">{t('home.techCTA')}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <div ref={techImageRef} className="relative">
              <div className="absolute inset-0 -m-8 flex items-center justify-center pointer-events-none">
                <SunwaveRipple rings={6} className="w-full h-full opacity-40" />
              </div>
              <GuitarOutlineDraw className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-15 hidden lg:block" />
              <motion.div
                initial={{ clipPath: 'circle(0% at 50% 50%)' }}
                animate={techIsInView ? { clipPath: 'circle(72% at 50% 50%)' } : { clipPath: 'circle(0% at 50% 50%)' }}
                transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
                className="relative z-10"
              >
                <GlowingCard borderRadius="1.5rem">
                  <div className="aspect-video bg-[#1a1714] rounded-[calc(1.5rem-2px)] overflow-hidden flex items-center justify-center p-3 relative">
                    <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(244,231,215,0.08) 0%, transparent 70%)' }} />
                    <div className="absolute bottom-0 inset-x-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none" />
                    <OptimizedImage src="/images/products/ayers-tech-1.png" alt="Ayers Sunwave Technology" className="w-full h-auto object-contain relative z-0" sizes="(min-width: 1024px) 50vw, 90vw" />
                  </div>
                </GlowingCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. ULURU UKULELE
          ═══════════════════════════════════════════════════════════ */}
      <section id="uluru" className="py-24 sm:py-32 bg-ayers-warm-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="md:col-span-5"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-ayers-gold mb-6">{t('home.uluruLabel')}</p>
              <WordMaskReveal text={t('home.uluruTitle1')} as="h2" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic font-bold mb-2 leading-tight" />
              <WordMaskReveal text={t('home.uluruTitle2')} as="h2" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic font-bold mb-6 leading-tight" delay={0.12} />
              <div className="w-14 h-[2px] bg-ayers-gold/40 mb-6" />
              <p className="text-sm sm:text-base md:text-lg text-ayers-ink/60 leading-relaxed mb-10 max-w-sm">{t('home.uluruBody')}</p>
              <Link to="/collections" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-ayers-gold transition-colors">
                <span className="border-b-2 border-ayers-gold pb-1">{t('home.uluruCTA')}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <div className="md:col-span-7 grid grid-cols-2 gap-3 sm:gap-5">
              {[
                { src: '/images/products/uluru/manako-iii-front.png', alt: 'Manako III', delay: 0 },
                { src: '/images/products/uluru/kohola-i-front.png', alt: 'Kohola I', delay: 0.12 },
              ].map((img, i) => (
                <motion.div
                  key={img.alt}
                  initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0 round 1.25rem)' }}
                  whileInView={{ opacity: 1, clipPath: 'inset(0% 0 0 0 round 1.25rem)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: img.delay, ease: EASE_OUT_EXPO }}
                  className={i === 1 ? 'mt-12' : ''}
                >
                  <GlowingCard borderRadius="1.25rem">
                    <div className="aspect-[3/4] bg-[#1a1714] rounded-[calc(1.25rem-2px)] overflow-hidden flex items-center justify-center relative">
                      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 15%, rgba(244,231,215,0.10) 0%, transparent 70%)' }} />
                      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(ellipse 50% 55% at 50% 55%, rgba(197,160,89,0.08) 0%, transparent 70%)' }} />
                      <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent z-10 pointer-events-none" />
                      <OptimizedImage src={img.src} alt={img.alt} className="w-full h-full object-contain scale-[1.35] relative z-0" sizes="(min-width: 768px) 35vw, 45vw" />
                    </div>
                  </GlowingCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. CUSTOMIZER CTA
          ═══════════════════════════════════════════════════════════ */}
      <section id="customizer" className="py-16 sm:py-24 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div
            className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden px-8 py-14 sm:p-16 md:p-20"
            style={{ background: `linear-gradient(135deg, ${ESPRESSO} 0%, ${ESPRESSO_DARK} 50%, ${ESPRESSO} 100%)` }}
          >
            <StringPluck count={5} className="z-[1]" />

            {/* Warm orb — CSS animation 取代 motion */}
            <div
              className="absolute top-0 right-0 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-[radial-gradient(circle,_rgba(197,160,89,0.08)_0%,_transparent_70%)] pointer-events-none will-change-transform"
              style={{ animation: 'float-orb 14s ease-in-out infinite' }}
            />

            {/* Koi fish — CSS animation 取代 motion */}
            <svg
              className="absolute top-10 right-12 w-28 h-16 text-ayers-gold pointer-events-none opacity-[0.04] hidden lg:block will-change-transform"
              viewBox="0 0 120 60" fill="currentColor"
              style={{ animation: 'float-y 7s ease-in-out infinite' }}
            >
              <path d="M100 30 Q90 10 70 15 Q55 18 45 30 Q35 18 20 20 Q5 22 0 30 Q5 38 20 40 Q35 42 45 30 Q55 42 70 45 Q90 50 100 30 Z" />
              <path d="M105 25 Q115 20 120 30 Q115 40 105 35 Z" />
            </svg>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="max-w-xl text-ayers-warm-cream"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-ayers-gold mb-6">
                  {t('home.customizerLabel')}
                </p>
                <WordMaskReveal text={t('home.customizerTitle1')} as="h2" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic font-bold mb-2 leading-tight" />
                <WordMaskReveal text={t('home.customizerTitle2')} as="h2" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic font-bold mb-6 leading-tight text-ayers-gold" delay={0.12} />
                <p className="text-sm sm:text-base text-ayers-warm-cream/45 mb-10 leading-relaxed font-light">{t('home.customizerBody')}</p>
                <Link to="/customizer">
                  <motion.span
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-ayers-warm-cream text-ayers-espresso px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-ayers-gold hover:text-white transition-colors"
                  >
                    <PickIcon size={11} />
                    {t('home.customizerCTA')}
                  </motion.span>
                </Link>
              </motion.div>

              {/* Sound hole ornament */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <div className="relative w-44 h-44 sm:w-56 sm:h-56">
                  <div
                    className="absolute inset-0 will-change-transform"
                    style={{ animation: 'spin 30s linear infinite' }}
                  >
                    <Rosette size={256} className="w-full h-full text-ayers-gold/15" />
                  </div>
                  <div className="absolute inset-12 sm:inset-16 bg-ayers-gold/90 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg sm:text-xl font-serif italic font-bold">3D</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. STATS
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="stats" className="py-20 sm:py-28"
        style={{ background: `linear-gradient(135deg, ${ESPRESSO}, ${ESPRESSO_DARK})` }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-3 gap-3 sm:gap-8 text-center">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="relative"
              >
                <p className="text-2xl sm:text-5xl md:text-6xl font-serif italic font-bold text-ayers-warm-cream mb-2">
                  <OdometerCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-ayers-gold">
                  {t(stat.labelKey)}
                </p>
                {i < STATS.length - 1 && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 w-px h-10 bg-ayers-warm-cream/10 hidden sm:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GUITAR OUTLINE — SVG path drawing for tech section
   ══════════════════════════════════════════════════════════════ */

function GuitarOutlineDraw({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20%' });

  const paths = [
    { d: 'M30 5 L30 35', delay: 0 },
    { d: 'M24 20 L36 20', delay: 0.2 },
    { d: 'M20 35 Q15 42 15 52 Q15 62 18 68 Q12 72 12 80 Q12 92 22 95 Q28 97 30 97 Q32 97 38 95 Q48 92 48 80 Q48 72 42 68 Q45 62 45 52 Q45 42 40 35 Z', delay: 0.4 },
    { d: 'M22 72 A8 8 0 1 1 38 72 A8 8 0 1 1 22 72 Z', delay: 0.7 },
  ];

  return (
    <svg ref={ref} viewBox="0 0 60 100" width="80" height="130" className={className}>
      {paths.map((path, i) => (
        <motion.path
          key={i} d={path.d}
          fill="none" stroke="rgba(197,160,89,0.4)" strokeWidth={1.2} strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{
            pathLength: { duration: 1.8, delay: path.delay, ease: EASE_OUT_EXPO },
            opacity: { duration: 0.3, delay: path.delay },
          }}
        />
      ))}
    </svg>
  );
}
