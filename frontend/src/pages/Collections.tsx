import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ChevronDown, ChevronLeft, ChevronRight, X, ArrowUpRight, Heart } from 'lucide-react';
import bannerService from '@/src/services/bannerService';
import { cn } from '@/src/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import productService, { type Product } from '@/src/services/productService';
import OptimizedImage from '@/src/components/OptimizedImage';
import SEO from '@/src/components/SEO';
import { useCartContext } from '@/src/contexts/CartContext';
import { useWishlist } from '@/src/contexts/WishlistContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useLocalizedNavigate } from '@/src/lib/i18nRouting';
import { Rosette, FretDot, PickIcon, BridgePinIcon, TuningPegIcon, StringDivider, GuitarSunLoader } from '@/src/components/guitar';
import { useTranslation } from 'react-i18next';

/* ─────────────────────────── HERO BANNER CAROUSEL ─────────────────────────── */

const HERO_BANNERS = [
  {
    id: 'wave',
    bg: '/images/products/wave/a05c-wave-detail.jpg',
    guitar: '/images/products/wave/d09-wave-front.png',
    label: 'NEW ARRIVAL',
    title: 'Wave 濤系列',
    subtitle: '聲波如潮水般層疊推進，音色飽滿厚實',
    cta: { text: '探索 Wave 系列', link: '/collections?series=wave' },
    gradient: 'from-[#1a2a3a] via-[#1a2a3a]/80 to-transparent',
  },
  {
    id: 'sun',
    bg: '/images/products/sun/a06-autumn-sun-detail.jpg',
    guitar: '/images/products/sun/sj07c-passion-front.png',
    label: 'BEST SELLER',
    title: 'Sun 日系列',
    subtitle: '聲如日光般溫暖綻放，溫潤而明亮的經典音色',
    cta: { text: '探索 Sun 系列', link: '/collections?series=sun' },
    gradient: 'from-[#2a1a0e] via-[#2a1a0e]/80 to-transparent',
  },
  {
    id: 'light',
    bg: '/images/products/light/st2-ocean-bridge.png',
    guitar: '/images/products/light/om05-light-front.png',
    label: 'SIGNATURE',
    title: 'Light 光系列',
    subtitle: '輕若羽毛，純如本初，最純粹的原聲之美',
    cta: { text: '探索 Light 系列', link: '/collections?series=light' },
    gradient: 'from-[#1a1a2a] via-[#1a1a2a]/80 to-transparent',
  },
  {
    id: 'customizer',
    bg: '/images/products/wave/as03-wave-back-detail.jpg',
    guitar: '/images/products/light/st2-ocean-1.png',
    label: '3D CUSTOMIZER',
    title: '打造你的專屬吉他',
    subtitle: '從桶身到漆面，10 個步驟完成你的夢想之琴',
    cta: { text: '開始客製', link: '/customizer' },
    gradient: 'from-[#0e1a2a] via-[#0e1a2a]/80 to-transparent',
  },
];

const BANNER_INTERVAL = 5000;

function HeroBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [banners, setBanners] = useState(HERO_BANNERS);
  const { t } = useTranslation();

  // Fetch collections banners from admin API; fallback to HERO_BANNERS
  useEffect(() => {
    bannerService.getActiveBanners('collections')
      .then(apiBanners => {
        if (apiBanners.length > 0) {
          setBanners(apiBanners.map(b => ({
            id: b.slug || b.id,
            bg: b.image,
            guitar: b.productImage || b.image,
            label: b.subtitle || '',
            title: [b.titleWord1, b.titleWord2].filter(Boolean).join(' '),
            subtitle: b.body || '',
            cta: { text: b.ctaLabel || '了解更多', link: b.ctaLink || '/collections' },
            gradient: `from-[${b.gradientColor || '#1a1a1a'}] via-[${b.gradientColor || '#1a1a1a'}]/80 to-transparent`,
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, BANNER_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, current, banners.length]);

  const banner = banners[current];

  return (
    <section
      className="relative w-full h-[50vh] sm:h-[55vh] lg:h-[60vh] overflow-hidden bg-ayers-dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image — crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id + '-bg'}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src={banner.bg}
            alt=""
            className="w-full h-full object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay — left side for text readability */}
      <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} z-[1]`} />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center">
        <div className="flex items-center justify-between w-full gap-8">
          {/* Text side */}
          <AnimatePresence mode="wait">
            <motion.div
              key={banner.id + '-text'}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg"
            >
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-ayers-gold mb-4 border border-ayers-gold/30 px-3 py-1 rounded-full">
                {banner.label}
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif italic font-bold text-white mb-4 leading-tight">
                {t(`collections.banner_${banner.id}_title`, banner.title)}
              </h2>
              <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed mb-8 max-w-md">
                {t(`collections.banner_${banner.id}_subtitle`, banner.subtitle)}
              </p>
              <Link
                to={banner.cta.link}
                className="inline-flex items-center gap-2 bg-ayers-gold text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-ayers-dark transition-all duration-300"
              >
                {t(`collections.banner_${banner.id}_cta`, banner.cta.text)}
                <ChevronRight size={14} />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Guitar image — right side, desktop only */}
          <div className="hidden lg:flex items-center justify-center flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={banner.id + '-guitar'}
                initial={{ opacity: 0, y: 30, rotate: 2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -20, rotate: -2 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <OptimizedImage
                  src={banner.guitar}
                  alt=""
                  className="h-[40vh] lg:h-[48vh] object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  priority
                  sizes="30vw"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrent(prev => (prev - 1 + banners.length) % banners.length)}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => setCurrent(prev => (prev + 1) % HERO_BANNERS.length)}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>

      {/* Progress indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_BANNERS.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setCurrent(i)}
            className="relative p-1 cursor-pointer"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className="w-8 sm:w-12 h-[2px] bg-white/20 rounded-full overflow-hidden">
              {current === i ? (
                <motion.div
                  className="h-full bg-ayers-gold rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: BANNER_INTERVAL / 1000, ease: 'linear' }}
                  key={current}
                />
              ) : (
                <div className={`h-full rounded-full transition-all ${i < current ? 'bg-white/40 w-full' : 'bg-transparent'}`} />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/** Page intro — sound hole circle expanding to reveal page */
function PageIntro({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-ayers-dark flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: 1.2 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <GuitarSunLoader size={56} />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── DATA ─────────────────────────── */

const PLACEHOLDER_IMAGE = '/images/products/wave/a05c-wave-front.png';

const SERIES_DATA_RAW = [
  {
    name: 'Wave',
    nameZhKey: 'collections.waveNameZh',
    nameZhFallback: 'WAVE 濤系列',
    taglineKey: 'collections.waveTagline',
    taglineFallback: '聲波如潮 · 層層遞進',
    descKey: 'collections.waveDesc',
    descFallback: '聲波如潮水般層疊推進，音色飽滿厚實，動態層次分明。',
    img: '/images/products/wave/d09-wave-front.png',
  },
  {
    name: 'Light',
    nameZhKey: 'collections.lightNameZh',
    nameZhFallback: 'LIGHT 光系列',
    taglineKey: 'collections.lightTagline',
    taglineFallback: '輕若羽毛 · 純如本初',
    descKey: 'collections.lightDesc',
    descFallback: '輕若羽毛，純如本初，以輕盈結構呈現最純粹的原聲之美。',
    img: '/images/products/light/om05-light-front.png',
  },
  {
    name: 'Sun',
    nameZhKey: 'collections.sunNameZh',
    nameZhFallback: 'SUN 日系列',
    taglineKey: 'collections.sunTagline',
    taglineFallback: '聲如日光 · 溫暖綻放',
    descKey: 'collections.sunDesc',
    descFallback: '聲如日光般溫暖綻放，結合精選木材與頂級工藝，音色溫潤而明亮。',
    img: '/images/products/sun/sj07c-passion-front.png',
  },
];

const BODY_SHAPES = ['Dreadnought', 'Orchestra Model', 'Auditorium', 'Grand Auditorium', 'Small Body', 'Super Jumbo', 'Parlor', 'Soprano', 'Concert'];
const TOP_WOODS = ['Spruce', 'Cedar', 'Mahogany', 'Maple'];
const BACK_WOODS = ['Rosewood', 'Mahogany', 'Maple', 'Ovangkol'];

const SORT_OPTIONS_RAW = [
  { value: 'newest', labelKey: 'collections.sortNewest', labelFallback: '最新上架', sortBy: 'createdAt', sortOrder: 'desc' as const },
  { value: 'price-asc', labelKey: 'collections.sortPriceAsc', labelFallback: '價格低 → 高', sortBy: 'price', sortOrder: 'asc' as const },
  { value: 'price-desc', labelKey: 'collections.sortPriceDesc', labelFallback: '價格高 → 低', sortBy: 'price', sortOrder: 'desc' as const },
  { value: 'name', labelKey: 'collections.sortName', labelFallback: '名稱 A–Z', sortBy: 'name', sortOrder: 'asc' as const },
];

/* ─────────────────────── MAIN PAGE ────────────────────────── */

export default function Collections() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialSeries = searchParams.get('series');

  const SERIES_DATA = SERIES_DATA_RAW.map(s => ({
    ...s,
    nameZh: t(s.nameZhKey, s.nameZhFallback),
    tagline: t(s.taglineKey, s.taglineFallback),
    desc: t(s.descKey, s.descFallback),
  }));

  const SORT_OPTIONS = SORT_OPTIONS_RAW.map(o => ({
    ...o,
    label: t(o.labelKey, o.labelFallback),
  }));

  const [showIntro, setShowIntro] = useState(true);
  const [activeSeries, setActiveSeries] = useState<string>(
    initialSeries ? initialSeries.charAt(0).toUpperCase() + initialSeries.slice(1) : ''
  );
  const [activeShape, setActiveShape] = useState<string[]>([]);
  const [activeTopWood, setActiveTopWood] = useState<string[]>([]);
  const [activeBackWood, setActiveBackWood] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(80000);
  const [sortOption, setSortOption] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { addToCart } = useCartContext();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, margin: '-40px' });

  /* ── Data fetching ── */
  useEffect(() => {
    productService.getCategories().then(res => {
      if (res.success) {
        setCategories(res.data);
        // Resolve short series name from URL (e.g. "Sun") to full category name (e.g. "Sun Series")
        if (initialSeries) {
          const capitalized = initialSeries.charAt(0).toUpperCase() + initialSeries.slice(1);
          const match = res.data.find((c: { name: string }) => c.name === capitalized || c.name.startsWith(capitalized + ' '));
          if (match) setActiveSeries(match.name);
        }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
          const selectedCategory = activeSeries
            ? categories.find(c => c.name === activeSeries || c.name.startsWith(activeSeries + ' '))?.slug || activeSeries.toLowerCase() + '-series'
            : undefined;
          const sort = SORT_OPTIONS.find(o => o.value === sortOption) || SORT_OPTIONS[0];
          const res = await productService.getProducts({
            page: 1, limit: 60,
            maxPrice: priceRange < 80000 ? priceRange : undefined,
            category: selectedCategory,
            sortBy: sort.sortBy,
            sortOrder: sort.sortOrder,
          });
          if (res.success) setProducts(res.data.products);
          else setError(t('collections.loadFailed', 'Failed to load products.'));
        } catch (err: any) {
          setError(err.response?.data?.message || t('collections.loadFailedRetry', '載入失敗，請重試。'));
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [activeSeries, priceRange, categories, retryCount, sortOption]);

  /* ── Helpers ── */
  const toggleList = (list: string[], setList: (l: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const filteredProducts = products.filter(p => {
    const specs = p.specifications || {};
    const specsStr = Object.values(specs).join(' ').toLowerCase();
    const desc = ((p.description || '') + ' ' + (p.name || '')).toLowerCase();
    const searchText = specsStr + ' ' + desc;

    if (activeShape.length > 0 && !activeShape.some(s => searchText.includes(s.toLowerCase()))) return false;
    if (activeTopWood.length > 0) {
      const topVal = String(specs.top || '').toLowerCase();
      if (!activeTopWood.some(w => topVal.includes(w.toLowerCase()))) return false;
    }
    if (activeBackWood.length > 0) {
      const backVal = String(specs.backSides || '').toLowerCase();
      if (!activeBackWood.some(w => backVal.includes(w.toLowerCase()))) return false;
    }
    return true;
  });

  const getProductImage = (p: Product) => (p.images && p.images.length > 0) ? p.images[0] : PLACEHOLDER_IMAGE;
  const getProductSecondImage = (p: Product) => (p.images && p.images.length > 1) ? p.images[1] : null;
  const getProductSeries = (p: Product) => p.category?.name || 'Guitar';

  const handleAddToCart = (p: Product) => {
    addToCart({ productId: p.id, name: p.name, price: p.price, image: getProductImage(p) });
  };

  const seriesList = categories.length > 0 ? categories.map(c => c.name) : SERIES_DATA.map(s => s.name);
  const activeFilterCount =
    (activeSeries ? 1 : 0) + activeShape.length + activeTopWood.length + activeBackWood.length + (priceRange < 80000 ? 1 : 0);
  const clearAllFilters = () => {
    setActiveSeries(''); setActiveShape([]); setActiveTopWood([]); setActiveBackWood([]); setPriceRange(80000);
  };

  const currentSeriesData = SERIES_DATA.find(s => s.name === activeSeries);

  return (
    <div className="bg-ayers-cream min-h-screen">
      <SEO
        title={t('collections.seoTitle', '吉他系列 — 探索所有 Ayers 手工吉他')}
        description={t('collections.seoDesc', '瀏覽 Ayers 全系列手工吉他：Wave 濤系列、Sun 日系列、Light 光系列、Uluru 烏克麗麗系列。')}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: t('collections.pageTitle', 'Collections'), url: '/collections' },
        ]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Ayers Guitars Collections',
          description: 'Browse all Ayers handcrafted acoustic guitar series.',
          url: 'https://www.ayersguitars.com/zh-TW/collections',
        }}
      />
      {/* ── Page Intro — Sound hole rosette reveal ── */}
      <AnimatePresence>
        {showIntro && <PageIntro onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          0. HERO BANNER CAROUSEL — Full-width ad/promo rotator
          ══════════════════════════════════════════════════════════ */}
      <HeroBannerCarousel />

      {/* ══════════════════════════════════════════════════════════
          1. PRODUCTS — Sidebar + Grid
          ══════════════════════════════════════════════════════════ */}
      <section ref={gridRef} className="pb-20 sm:pb-28 bg-ayers-cream">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

          {/* Toolbar with string dividers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={gridInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between py-3 mb-6">
              {/* Left: count + tags */}
              <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                {!loading && (
                  <span className="text-xs text-ayers-ink/30 font-medium whitespace-nowrap flex items-center gap-1.5">
                    <PickIcon size={10} className="text-ayers-gold/40" />
                    {t('collections.guitarCount', '{{count}} 款吉他', { count: filteredProducts.length })}
                  </span>
                )}
                <AnimatePresence>
                  {[
                    ...activeShape.map(s => ({ key: `shape-${s}`, label: s, clear: () => toggleList(activeShape, setActiveShape, s) })),
                    ...activeTopWood.map(w => ({ key: `top-${w}`, label: w, clear: () => toggleList(activeTopWood, setActiveTopWood, w) })),
                    ...activeBackWood.map(w => ({ key: `back-${w}`, label: w, clear: () => toggleList(activeBackWood, setActiveBackWood, w) })),
                    ...(priceRange < 80000 ? [{ key: 'price', label: `≤ NT$${priceRange.toLocaleString()}`, clear: () => setPriceRange(80000) }] : []),
                  ].map(tag => (
                    <motion.button
                      key={tag.key}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      onClick={tag.clear}
                      className="flex items-center gap-1 bg-ayers-gold/[0.08] hover:bg-ayers-gold/15 px-2.5 py-1 rounded-full text-[10px] font-medium text-ayers-gold/70 transition-colors cursor-pointer"
                    >
                      {tag.label}
                      <X size={9} />
                    </motion.button>
                  ))}
                </AnimatePresence>
                {activeFilterCount > 1 && (
                  <button onClick={clearAllFilters} className="text-[10px] text-ayers-ink/25 hover:text-ayers-gold font-bold uppercase tracking-wider transition-colors cursor-pointer">
                    {t('collections.clearAll', '全部清除')}
                  </button>
                )}
              </div>

              {/* Right: sort + mobile filter */}
              <div className="flex items-center gap-2.5">
                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ayers-ink/30 hover:text-ayers-ink transition-colors cursor-pointer"
                  >
                    {t('collections.sortLabel', '排序')}：{SORT_OPTIONS.find(o => o.value === sortOption)?.label}
                    <ChevronDown size={11} className={cn('transition-transform', sortOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-ayers-ink/5 py-1.5 min-w-[160px] z-50"
                        >
                          {SORT_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => { setSortOption(opt.value); setSortOpen(false); }}
                              className={cn(
                                'w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between gap-4',
                                sortOption === opt.value
                                  ? 'text-ayers-gold font-bold'
                                  : 'text-ayers-ink/40 hover:text-ayers-ink hover:bg-ayers-ink/[0.02]'
                              )}
                            >
                              {opt.label}
                              {sortOption === opt.value && <PickIcon size={10} className="text-ayers-gold" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile filter trigger with tuning peg icon */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm border border-ayers-ink/5 hover:border-ayers-gold transition-colors cursor-pointer"
                >
                  <TuningPegIcon size={14} className="text-ayers-ink/40" />
                  {t('collections.filter', '篩選')}
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-ayers-gold text-white text-[9px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* ── Desktop Sidebar with rosette section headers ── */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-28 space-y-0">
                <FilterSection title={t('collections.filterSeries', '系列 Series')} icon="rosette" defaultOpen>
                  {seriesList.map(s => (
                    <FilterChip key={s} label={s} active={activeSeries === s} onClick={() => setActiveSeries(activeSeries === s ? '' : s)} />
                  ))}
                </FilterSection>

                <FilterSection title={t('collections.filterBodyShape', '琴型 Body Shape')} icon="body">
                  {BODY_SHAPES.map(s => (
                    <FilterChip key={s} label={s} active={activeShape.includes(s)} onClick={() => toggleList(activeShape, setActiveShape, s)} />
                  ))}
                </FilterSection>

                <FilterSection title={t('collections.filterTopWood', '面板 Top Wood')} icon="wood">
                  {TOP_WOODS.map(w => (
                    <FilterChip key={w} label={w} active={activeTopWood.includes(w)} onClick={() => toggleList(activeTopWood, setActiveTopWood, w)} />
                  ))}
                </FilterSection>

                <FilterSection title={t('collections.filterBackSides', '背側板 Back & Sides')} icon="wood">
                  {BACK_WOODS.map(w => (
                    <FilterChip key={w} label={w} active={activeBackWood.includes(w)} onClick={() => toggleList(activeBackWood, setActiveBackWood, w)} />
                  ))}
                </FilterSection>

                <FilterSection title={t('collections.filterPrice', '價格 Price')} icon="pick">
                  <PriceSlider value={priceRange} onChange={setPriceRange} />
                </FilterSection>
              </div>
            </aside>

            {/* ── Mobile Filter Drawer ── */}
            <AnimatePresence>
              {mobileFilterOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileFilterOpen(false)}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 lg:hidden"
                  />
                  <motion.aside
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 bottom-0 w-80 bg-ayers-cream z-50 lg:hidden overflow-y-auto p-7 shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <TuningPegIcon size={16} className="text-ayers-gold/50" />
                        <h3 className="text-base font-serif italic font-bold">{t('collections.filterConditions', '篩選條件')}</h3>
                      </div>
                      <button onClick={() => setMobileFilterOpen(false)} className="p-2 hover:bg-ayers-ink/5 rounded-full transition-colors cursor-pointer">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="space-y-0">
                      <FilterSection title={t('collections.filterSeriesMobile', '系列')} icon="rosette" defaultOpen>
                        {seriesList.map(s => (
                          <FilterChip key={s} label={s} active={activeSeries === s} onClick={() => setActiveSeries(activeSeries === s ? '' : s)} />
                        ))}
                      </FilterSection>
                      <FilterSection title={t('collections.filterBodyShapeMobile', '琴型')} icon="body">
                        {BODY_SHAPES.map(s => (
                          <FilterChip key={s} label={s} active={activeShape.includes(s)} onClick={() => toggleList(activeShape, setActiveShape, s)} />
                        ))}
                      </FilterSection>
                      <FilterSection title={t('collections.filterTopWoodMobile', '面板')} icon="wood">
                        {TOP_WOODS.map(w => (
                          <FilterChip key={w} label={w} active={activeTopWood.includes(w)} onClick={() => toggleList(activeTopWood, setActiveTopWood, w)} />
                        ))}
                      </FilterSection>
                      <FilterSection title={t('collections.filterBackSidesMobile', '背側板')} icon="wood">
                        {BACK_WOODS.map(w => (
                          <FilterChip key={w} label={w} active={activeBackWood.includes(w)} onClick={() => toggleList(activeBackWood, setActiveBackWood, w)} />
                        ))}
                      </FilterSection>
                      <FilterSection title={t('collections.filterPriceMobile', '價格')} icon="pick">
                        <PriceSlider value={priceRange} onChange={setPriceRange} />
                      </FilterSection>
                    </div>
                    {activeFilterCount > 0 && (
                      <button onClick={() => { clearAllFilters(); setMobileFilterOpen(false); }} className="w-full mt-6 py-3 text-xs font-bold uppercase tracking-widest text-ayers-gold border border-ayers-gold rounded-xl hover:bg-ayers-gold hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2">
                        <PickIcon size={12} />
                        {t('collections.clearAllMobile', '清除全部')}
                      </button>
                    )}
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* ── Product Grid ── */}
            <main className="flex-grow min-w-0">
              {/* Skeleton loading — shows placeholder cards during fetch */}
              {loading && (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] rounded-2xl bg-ayers-ink/[0.04] mb-3" />
                      <div className="h-3 bg-ayers-ink/[0.06] rounded-full w-1/3 mb-2" />
                      <div className="h-4 bg-ayers-ink/[0.08] rounded-full w-3/4 mb-2" />
                      <div className="h-3 bg-ayers-ink/[0.06] rounded-full w-1/4" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {!loading && error && (
                <div className="text-center py-24">
                  <img src="/images/ayers/guitar-sun.png" alt="" className="mx-auto mb-6 w-16 h-16 opacity-20" draggable={false} />
                  <p className="text-base text-ayers-ink/50 font-serif italic mb-4">{error}</p>
                  <button
                    onClick={() => { setError(null); setRetryCount(c => c + 1); }}
                    className="text-xs font-bold uppercase tracking-widest text-ayers-gold hover:text-ayers-ink transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <PickIcon size={10} />
                    {t('collections.retry', '重試')}
                  </button>
                </div>
              )}

              {/* Product cards */}
              {!loading && !error && (
                <>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                    {filteredProducts.map((product, i) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={i}
                        getImage={getProductImage}
                        getSecondImage={getProductSecondImage}
                        getSeries={getProductSeries}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-24">
                      <img src="/images/ayers/guitar-sun.png" alt="" className="mx-auto mb-6 w-16 h-16 opacity-15" draggable={false} />
                      <p className="text-base text-ayers-ink/30 font-serif italic mb-2">{t('collections.noResults', '找不到符合條件的吉他')}</p>
                      <p className="text-xs text-ayers-ink/15 mb-6">{t('collections.adjustFilters', '試試調整篩選條件')}</p>
                      <button
                        onClick={clearAllFilters}
                        className="bg-ayers-ink text-white px-7 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <PickIcon size={12} />
                        {t('collections.clearAllFilters', '清除全部篩選')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT CARD — Front/back swap, rosette glow, bridge pin add
   ══════════════════════════════════════════════════════════════ */

function ProductCard({
  product, index, getImage, getSecondImage, getSeries, onAddToCart,
}: {
  product: Product; index: number;
  getImage: (p: Product) => string;
  getSecondImage: (p: Product) => string | null;
  getSeries: (p: Product) => string;
  onAddToCart: (p: Product) => void;
}) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggle } = useWishlist();
  const navigate = useLocalizedNavigate();
  const series = getSeries(product);
  const secondImg = getSecondImage(product);
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-40px' });
  const wishlisted = isInWishlist(product.id);

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }, [onAddToCart, product]);

  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggle(product.id);
  }, [isAuthenticated, navigate, toggle, product.id]);

  // Mouse-tracking parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const imgX = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 18 });
  const imgY = useSpring(useTransform(my, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 18 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mx, my]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); mx.set(0); my.set(0); }}
      onMouseMove={handleMouseMove}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-[#1a1714]">
          {/* Ambient spotlight from top */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 50% at 50% 15%, rgba(244,231,215,0.12) 0%, transparent 70%)',
            }}
          />

          {/* Warm glow behind guitar — amplified on hover */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0.4 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 55% 60% at 50% 55%, rgba(197,160,89,0.10) 0%, transparent 70%)',
            }}
          />

          {/* Bottom vignette for depth */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent z-[1] pointer-events-none" />
          {/* Top subtle vignette */}
          <div className="absolute top-0 inset-x-0 h-1/5 bg-gradient-to-b from-black/10 to-transparent z-[1] pointer-events-none" />

          {/* Front image */}
          <motion.img
            src={getImage(product)}
            alt={product.name}
            style={{ x: imgX, y: imgY }}
            animate={{
              scale: isHovered ? 1.38 : 1.35,
              opacity: (isHovered && secondImg) ? 0 : 1,
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-contain z-0"
            referrerPolicy="no-referrer"
          />

          {/* Back image on hover */}
          {secondImg && (
            <motion.img
              src={secondImg}
              alt={`${product.name} back`}
              style={{ x: imgX, y: imgY }}
              initial={false}
              animate={{
                scale: isHovered ? 1.38 : 1.4,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full object-contain z-0"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Sold out */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-ayers-cream/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-2">
              <img src="/images/ayers/guitar-sun.png" alt="" className="w-10 h-10 opacity-15" draggable={false} />
              <span className="text-ayers-ink/30 text-[9px] font-bold uppercase tracking-[0.3em]">
                {t('collections.soldOut', 'Sold Out')}
              </span>
            </div>
          )}

          {/* Wishlist heart button */}
          <motion.button
            initial={false}
            animate={{ opacity: isHovered || wishlisted ? 1 : 0, y: isHovered || wishlisted ? 0 : 6 }}
            transition={{ duration: 0.2 }}
            onClick={handleWishlist}
            className={cn(
              'absolute bottom-3 left-3 z-10 flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all duration-200 cursor-pointer',
              wishlisted
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white text-ayers-ink hover:bg-red-50 hover:text-red-500 hover:scale-105'
            )}
            title={wishlisted ? t('wishlist.remove', '從願望清單移除') : t('wishlist.add', '加入願望清單')}
          >
            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
          </motion.button>

          {/* Quick add — bridge pin button */}
          {product.stock > 0 && (
            <motion.button
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 6 }}
              transition={{ duration: 0.2 }}
              onClick={handleAdd}
              className={cn(
                'absolute bottom-3 right-3 z-10 flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all duration-200 cursor-pointer',
                added
                  ? 'bg-green-500 text-white scale-110'
                  : 'bg-white text-ayers-ink hover:bg-ayers-gold hover:text-white hover:scale-105'
              )}
              title={t('collections.addToCart', '加入購物車')}
            >
              {added ? (
                <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </motion.div>
              ) : (
                <BridgePinIcon size={16} />
              )}
            </motion.button>
          )}

          {/* Detail arrow — top right */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowUpRight size={12} className="text-ayers-ink/50" />
          </motion.div>

          {/* "Front / Back" indicator when hovering with 2nd image */}
          {secondImg && (
            <motion.div
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-white/70 backdrop-blur-sm rounded-full px-2.5 py-1"
            >
              <span className="text-[8px] font-bold uppercase tracking-wider text-ayers-ink/40">
                {isHovered ? t('collections.back', 'Back') : t('collections.front', 'Front')}
              </span>
            </motion.div>
          )}
        </div>
      </Link>

      {/* Product info */}
      <div className="px-0.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-ayers-gold/40 mb-0.5 flex items-center gap-1">
          <Rosette size={10} className="text-ayers-gold/30" />
          {series} {t('collections.seriesLabel', 'Series').toLowerCase()}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-[13px] sm:text-sm font-serif italic font-bold text-ayers-ink group-hover:text-ayers-gold transition-colors leading-snug mb-0.5">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm font-bold text-ayers-ink/65 tracking-tight">
          NT${product.price.toLocaleString()}
        </p>
        {product.stock > 0 && product.stock <= 3 && (
          <p className="text-[8px] font-bold uppercase tracking-widest text-amber-600/50 mt-0.5 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-amber-500/50 animate-pulse" />
            {t('collections.onlyLeft', '僅剩 {{count}} 把', { count: product.stock })}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FILTER COMPONENTS — Guitar-themed icons & fret dot checkboxes
   ══════════════════════════════════════════════════════════════ */

/** Small icon for filter section headers */
function FilterSectionIcon({ type }: { type: string }) {
  switch (type) {
    case 'rosette':
      return <Rosette size={14} className="text-ayers-gold/40" />;
    case 'body':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-ayers-gold/40">
          <path d="M12 2Q8 2 6 6Q4 10 5 15Q3 17 3 20Q3 22 8 23Q12 23 12 23Q12 23 16 23Q21 22 21 20Q21 17 19 15Q20 10 18 6Q16 2 12 2Z" />
        </svg>
      );
    case 'wood':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-ayers-gold/40">
          <circle cx="12" cy="12" r="9" />
          <path d="M6 8Q9 10 12 8Q15 6 18 8" />
          <path d="M5 12Q9 14 12 12Q15 10 19 12" />
          <path d="M6 16Q9 18 12 16Q15 14 18 16" />
        </svg>
      );
    case 'pick':
      return <PickIcon size={12} className="text-ayers-gold/40" />;
    default:
      return null;
  }
}

function FilterSection({ title, children, icon, defaultOpen = false }: { title: string; children: React.ReactNode; icon?: string; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ayers-ink/6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-3.5 group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {icon && <FilterSectionIcon type={icon} />}
          <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-ayers-ink/55 group-hover:text-ayers-ink transition-colors">
            {title}
          </h4>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={12} className="text-ayers-ink/20" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-0 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[12px] transition-all duration-150 cursor-pointer',
        active
          ? 'text-ayers-gold font-bold'
          : 'text-ayers-ink/40 hover:text-ayers-ink/65 hover:bg-ayers-ink/[0.02]'
      )}
    >
      <FretDot active={active} className={active ? 'text-ayers-gold' : 'text-ayers-ink/30'} />
      <span>{label}</span>
    </button>
  );
}

function PriceSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { t } = useTranslation();
  const percentage = ((value - 5000) / (80000 - 5000)) * 100;

  return (
    <div className="space-y-4 pt-1 pb-1">
      <div className="relative h-8 flex items-center">
        {/* Track — looks like a string */}
        <div className="absolute inset-x-0 h-[2px] bg-ayers-ink/[0.08] rounded-full" />
        {/* Fret markers */}
        {[0, 25, 50, 75, 100].map(pos => (
          <div
            key={pos}
            className="absolute w-0.5 h-2 bg-ayers-ink/[0.06] rounded-full -translate-x-1/2"
            style={{ left: `${pos}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
          />
        ))}
        {/* Filled track */}
        <motion.div
          className="absolute left-0 h-[2px] bg-ayers-gold/50 rounded-full"
          style={{ width: `${percentage}%` }}
          layout
        />
        <input
          type="range"
          min="5000"
          max="80000"
          step="1000"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        {/* Thumb — pick shape */}
        <motion.div
          className="absolute pointer-events-none flex items-center justify-center"
          style={{ left: `calc(${percentage}% - 9px)` }}
          layout
        >
          <div className="w-[18px] h-[18px] bg-white border-2 border-ayers-gold rounded-full shadow-sm flex items-center justify-center">
            <PickIcon size={8} className="text-ayers-gold" />
          </div>
        </motion.div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-ayers-ink/25">NT$5,000</span>
        <span className="text-[10px] font-mono font-bold text-ayers-ink/55">
          {value >= 80000 ? t('collections.noLimit', '不限') : `NT$${value.toLocaleString()}`}
        </span>
      </div>
    </div>
  );
}
