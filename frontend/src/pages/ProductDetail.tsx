import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ChevronDown,
  X,
  ZoomIn,
  Package,
  Star,
  Send,
  ThumbsUp,
  User,
} from 'lucide-react';
import { GuitarSunLoader } from '@/src/components/guitar';
import OptimizedImage from '@/src/components/OptimizedImage';
import SEO, { type BreadcrumbItem } from '@/src/components/SEO';
import { useLanguagePrefix } from '@/src/lib/i18nRouting';
import { cn } from '@/src/lib/utils';
import productService, { type Product } from '@/src/services/productService';
import reviewService, { type Review } from '@/src/services/reviewService';
import { useCartContext } from '@/src/contexts/CartContext';
import { useAuth } from '@/src/contexts/AuthContext';

// ─── Collapsible Section ─────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  delay = 0,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  delay?: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>(defaultOpen ? 'auto' : 0);

  useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      const h = contentRef.current.scrollHeight;
      setContentHeight(h);
      const timer = setTimeout(() => setContentHeight('auto'), 350);
      return () => clearTimeout(timer);
    } else {
      // set explicit height first so transition works
      setContentHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setContentHeight(0));
      });
    }
  }, [isOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="border-b border-ayers-ink/8"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-5 group text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ayers-ink/50 group-hover:text-ayers-ink transition-colors">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-ayers-ink/30"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <div
        ref={contentRef}
        style={{ height: contentHeight, overflow: 'hidden' }}
        className="transition-[height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        <div className="pb-6">{children}</div>
      </div>
    </motion.div>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
      >
        <X size={28} strokeWidth={1.5} />
      </button>
      <motion.img
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] object-contain"
        referrerPolicy="no-referrer"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
}

// ─── Zoom Image ──────────────────────────────────────────────────────────────

function ZoomableImage({
  src,
  alt,
  onOpenLightbox,
}: {
  src: string;
  alt: string;
  onOpenLightbox: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-[#1a1714] rounded-[2rem] overflow-hidden aspect-[4/5] flex items-center justify-center shadow-lg cursor-zoom-in group"
      onMouseEnter={() => setIsZooming(true)}
      onMouseLeave={() => setIsZooming(false)}
      onMouseMove={handleMouseMove}
      onClick={onOpenLightbox}
    >
      {/* Ambient spotlight from top */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 12%, rgba(244,231,215,0.12) 0%, transparent 70%)' }} />
      {/* Warm glow behind guitar */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(ellipse 55% 60% at 50% 55%, rgba(197,160,89,0.08) 0%, transparent 70%)' }} />
      {/* Bottom vignette */}
      <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent z-10 pointer-events-none" />

      {/* Normal image */}
      <OptimizedImage
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-contain scale-[1.25] transition-opacity duration-300 relative z-[5]',
          isZooming ? 'opacity-0' : 'opacity-100'
        )}
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
      />

      {/* Zoomed image */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300 bg-[#1a1714] z-20',
          isZooming ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: '250%',
          backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Zoom hint */}
      <div
        className={cn(
          'absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 text-white/80 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-opacity duration-300 backdrop-blur-sm',
          isZooming ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
        )}
      >
        <ZoomIn size={12} />
        <span>Hover to zoom</span>
      </div>
    </div>
  );
}

// ─── Specifications Table ────────────────────────────────────────────────────

function SpecificationsTable({ specs }: { specs: Record<string, string | number> }) {
  const entries = Object.entries(specs);
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-ayers-ink/6">
      {entries.map(([key, value], i) => (
        <div
          key={key}
          className={cn(
            'flex items-start px-4 py-3 text-sm',
            i % 2 === 0 ? 'bg-ayers-ink/[0.02]' : 'bg-transparent'
          )}
        >
          <span className="w-2/5 flex-shrink-0 text-ayers-ink/45 font-medium text-xs uppercase tracking-wider">
            {key}
          </span>
          <span className="text-ayers-ink/80">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Price Display ───────────────────────────────────────────────────────────

function PriceDisplay({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const variantPrices = variants
    .map((v) => v.price)
    .filter((p): p is number => p != null && p > 0);

  if (variantPrices.length > 1) {
    const min = Math.min(...variantPrices);
    const max = Math.max(...variantPrices);
    if (min !== max) {
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-serif italic text-ayers-gold font-bold tracking-tight">
            NT${min.toLocaleString()}
          </span>
          <span className="text-2xl font-serif italic text-ayers-gold/60">
            &ndash; NT${max.toLocaleString()}
          </span>
        </div>
      );
    }
  }

  return (
    <span className="text-4xl md:text-5xl font-serif italic text-ayers-gold font-bold tracking-tight">
      NT${product.price.toLocaleString()}
    </span>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({
  rating,
  size = 16,
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={cn(
            'transition-colors',
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
          )}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors',
              (interactive ? hovered || rating : rating) >= star
                ? 'fill-ayers-gold text-ayers-gold'
                : 'fill-transparent text-ayers-ink/15',
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Reviews Section ─────────────────────────────────────────────────────────

function ReviewsSection({ productId }: { productId: string }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const res = await reviewService.getProductReviews(productId, { page: 1, limit: 50, sort: 'newest' });
      if (res.success) setReviews(res.data.reviews);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await reviewService.createReview({ productId, rating, comment: comment.trim() });
      setSubmitted(true);
      setRating(0);
      setComment('');
      fetchReviews();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (id: string) => {
    try {
      const res = await reviewService.markHelpful(id);
      if (res.success) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r)));
      }
    } catch {
      /* silent */
    }
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-20 border-t border-ayers-ink/8 pt-16"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-serif italic font-bold mb-2">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm text-ayers-ink/50">
                {avgRating.toFixed(1)} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      {isAuthenticated ? (
        submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-10"
          >
            <div className="flex items-center gap-2 text-green-700">
              <Check size={18} />
              <p className="text-sm font-medium">Thank you! Your review has been submitted and is pending approval.</p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ayers-ink/6 p-6 mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-ayers-ink/50 mb-4">
              Write a Review
            </h3>

            <div className="mb-4">
              <label className="block text-xs text-ayers-ink/40 mb-2">Your Rating</label>
              <StarRating rating={rating} size={24} interactive onChange={setRating} />
            </div>

            <div className="mb-4">
              <label className="block text-xs text-ayers-ink/40 mb-2">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full bg-ayers-cream/50 border border-ayers-ink/8 rounded-xl px-4 py-3 text-sm text-ayers-ink/80 placeholder:text-ayers-ink/25 focus:outline-none focus:ring-2 focus:ring-ayers-gold/30 focus:border-ayers-gold/40 transition-all resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 mb-3">{error}</p>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-[0.15em] text-[12px] transition-all',
                submitting
                  ? 'bg-ayers-ink/10 text-ayers-ink/30 cursor-not-allowed'
                  : 'bg-ayers-ink text-white hover:bg-ayers-ink/90',
              )}
            >
              <Send size={14} />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </motion.button>
          </form>
        )
      ) : (
        <div className="bg-ayers-cream/60 border border-ayers-ink/6 rounded-2xl p-6 mb-10 text-center">
          <p className="text-sm text-ayers-ink/50">
            <Link to="/login" className="text-ayers-gold font-bold hover:underline">Sign in</Link>
            {' '}to leave a review.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <GuitarSunLoader size={24} text="Loading reviews" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star size={40} className="mx-auto text-ayers-ink/10 mb-3" strokeWidth={1} />
          <p className="text-sm text-ayers-ink/35">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-ayers-ink/5 p-6 hover:border-ayers-ink/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ayers-gold/10 flex items-center justify-center text-ayers-gold">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous'}
                    </p>
                    <p className="text-[10px] text-ayers-ink/30">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} size={14} />
              </div>
              <p className="text-sm text-ayers-ink/65 leading-relaxed">{review.comment}</p>
              {review.helpfulCount > 0 && (
                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={() => handleHelpful(review.id)}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-ayers-ink/30 hover:text-ayers-gold transition-colors"
                  >
                    <ThumbsUp size={12} />
                    <span>Helpful ({review.helpfulCount})</span>
                  </button>
                </div>
              )}
              {(!review.helpfulCount || review.helpfulCount === 0) && (
                <div className="mt-3">
                  <button
                    onClick={() => handleHelpful(review.id)}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-ayers-ink/30 hover:text-ayers-gold transition-colors"
                  >
                    <ThumbsUp size={12} />
                    <span>Helpful</span>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCartContext();
  const lang = useLanguagePrefix();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setError('');

    productService
      .getProductById(id)
      .then((res) => {
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError('Product not found');
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err?.message || 'Failed to load product');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
      },
      quantity
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const inStock = product ? product.stock > 0 : false;
  const images = product?.images ?? [];
  const mainImage = images[selectedImageIndex] || '';

  // Try to parse specifications from description or a specs field
  const specifications: Record<string, string | number> | null = (() => {
    if (!product) return null;
    // Check if product has a specifications-like field (commonly embedded in the data)
    const p = product as unknown as Record<string, unknown>;
    if (p.specifications && typeof p.specifications === 'object') {
      return p.specifications as Record<string, string | number>;
    }
    return null;
  })();

  // ── Loading State ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="bg-ayers-cream min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <GuitarSunLoader size={40} text="Loading" />
        </motion.div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────

  if (error || !product) {
    return (
      <div className="bg-ayers-cream min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Package size={48} className="mx-auto text-ayers-ink/15 mb-6" strokeWidth={1} />
            <h1 className="text-4xl font-serif italic font-bold mb-4">
              {error || 'Product not found'}
            </h1>
            <Link
              to="/collections"
              className="inline-flex items-center space-x-2 text-ayers-gold font-bold uppercase tracking-widest text-sm hover:opacity-80 transition-opacity mt-6"
            >
              <span>Browse Collections</span>
              <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── SEO — Product Schema + Breadcrumbs ─────────────────────────────────

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: `/${lang}` },
    { name: 'Collections', url: `/${lang}/collections` },
    ...(product.category
      ? [{ name: product.category.name, url: `/${lang}/collections?category=${product.category.slug}` }]
      : []),
    { name: product.name, url: `/${lang}/product/${product.id}` },
  ];

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — Ayers Guitars handcrafted acoustic guitar`,
    image: images.map((img: string) => img.startsWith('http') ? img : `https://www.ayersguitars.com${img}`),
    brand: {
      '@type': 'Brand',
      name: 'Ayers Guitars',
    },
    ...(product.sku ? { sku: product.sku } : {}),
    offers: {
      '@type': 'Offer',
      url: `https://www.ayersguitars.com/${lang}/product/${product.id}`,
      priceCurrency: 'TWD',
      price: product.price,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Ayers Guitars',
      },
    },
  };

  // ── Main Render ──────────────────────────────────────────────────────────

  return (
    <>
      <SEO
        title={product.name}
        description={product.description || `${product.name} — Ayers Guitars 手工吉他`}
        ogImage={images[0]}
        ogType="product"
        breadcrumbs={breadcrumbs}
        jsonLd={productJsonLd}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && mainImage && (
          <Lightbox
            src={mainImage}
            alt={product.name}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="bg-ayers-cream min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] mb-12"
          >
            <Link
              to="/"
              className="text-ayers-ink/35 hover:text-ayers-ink/70 transition-colors"
            >
              Home
            </Link>
            <ChevronRight size={10} className="text-ayers-ink/20" />
            <Link
              to="/collections"
              className="text-ayers-ink/35 hover:text-ayers-ink/70 transition-colors"
            >
              Collections
            </Link>
            {product.category && (
              <>
                <ChevronRight size={10} className="text-ayers-ink/20" />
                <Link
                  to={`/collections?category=${product.category.slug}`}
                  className="text-ayers-ink/35 hover:text-ayers-ink/70 transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={10} className="text-ayers-ink/20" />
            <span className="text-ayers-ink/70 truncate max-w-[200px]">{product.name}</span>
          </motion.nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* ── Left Column: Images ──────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-5"
            >
              {/* Main Image */}
              {mainImage ? (
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImageIndex}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <ZoomableImage
                        src={mainImage}
                        alt={product.name}
                        onOpenLightbox={() => setLightboxOpen(true)}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute top-5 left-5 bg-black/50 backdrop-blur-sm text-white/80 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#1a1714] rounded-[2rem] overflow-hidden aspect-[4/5] flex items-center justify-center shadow-lg">
                  <div className="text-ayers-ink/20 text-center">
                    <ShoppingCart size={48} />
                    <p className="mt-2 text-sm">No image available</p>
                  </div>
                </div>
              )}

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        'relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300',
                        selectedImageIndex === i
                          ? 'ring-2 ring-ayers-gold ring-offset-2 ring-offset-ayers-cream shadow-[0_0_20px_rgba(197,160,89,0.25)]'
                          : 'ring-1 ring-ayers-ink/8 opacity-50 hover:opacity-90'
                      )}
                    >
                      <OptimizedImage
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                        sizes="80px"
                      />
                      {selectedImageIndex === i && (
                        <motion.div
                          layoutId="thumbnail-active"
                          className="absolute inset-0 rounded-xl ring-2 ring-ayers-gold"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── Right Column: Product Info (Sticky) ──────────────────── */}
            <div className="lg:self-start lg:sticky lg:top-8">
              <div className="space-y-0">
                {/* Category Badge */}
                {product.category && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[10px] font-bold uppercase tracking-[0.25em] text-ayers-gold mb-4"
                  >
                    {product.category.name}
                  </motion.p>
                )}

                {/* Product Name */}
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-4xl md:text-[2.75rem] font-serif italic font-bold leading-[1.15] mb-6"
                >
                  {product.name}
                </motion.h1>

                {/* Price */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-5"
                >
                  <PriceDisplay product={product} />
                </motion.div>

                {/* Stock Status */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="flex items-center gap-2 mb-8"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    {inStock && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                    )}
                    <span
                      className={cn(
                        'relative inline-flex h-2.5 w-2.5 rounded-full',
                        inStock ? 'bg-green-500' : 'bg-red-500'
                      )}
                    />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-ayers-ink/50">
                    {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </span>
                </motion.div>

                {/* ── Collapsible Sections ──────────────────────────────── */}
                <div className="border-t border-ayers-ink/8">
                  {/* Description */}
                  {product.description && (
                    <CollapsibleSection title="Description" defaultOpen={true} delay={0.4}>
                      <p className="text-ayers-ink/60 leading-[1.8] text-[15px]">
                        {product.description}
                      </p>
                    </CollapsibleSection>
                  )}

                  {/* Specifications */}
                  {specifications && (
                    <CollapsibleSection title="Specifications" delay={0.45}>
                      <SpecificationsTable specs={specifications} />
                    </CollapsibleSection>
                  )}

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <CollapsibleSection title="Available Variants" delay={0.5}>
                      <div className="space-y-2">
                        {product.variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="flex items-center justify-between bg-white rounded-xl p-4 border border-ayers-ink/5 hover:border-ayers-gold/30 transition-colors"
                          >
                            <div>
                              <p className="text-sm font-bold">{variant.sku}</p>
                              {variant.attributes && variant.attributes.length > 0 && (
                                <p className="text-xs text-ayers-ink/45 mt-1">
                                  {variant.attributes
                                    .map(
                                      (a: { name?: string; attribute?: { name: string }; value: string }) =>
                                        `${a.name || a.attribute?.name}: ${a.value}`
                                    )
                                    .join(' / ')}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {variant.price && (
                                <p className="text-sm font-bold">
                                  NT${variant.price.toLocaleString()}
                                </p>
                              )}
                              <p
                                className={cn(
                                  'text-xs',
                                  variant.stock > 0 ? 'text-green-600' : 'text-red-500'
                                )}
                              >
                                {variant.stock > 0
                                  ? `${variant.stock} in stock`
                                  : 'Out of stock'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}
                </div>

                {/* ── Quantity + Add to Cart ────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                  className="flex items-center gap-4 pt-8"
                >
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-white rounded-2xl border border-ayers-ink/8 overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-4 hover:bg-ayers-cream/80 transition-colors disabled:opacity-30"
                      disabled={!inStock}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-5 text-sm font-bold min-w-[2.5rem] text-center tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-4 hover:bg-ayers-cream/80 transition-colors disabled:opacity-30"
                      disabled={!inStock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={!inStock || addedToCart}
                    whileHover={inStock && !addedToCart ? { scale: 1.02 } : {}}
                    whileTap={inStock && !addedToCart ? { scale: 0.97 } : {}}
                    className={cn(
                      'relative flex-1 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-[13px] flex items-center justify-center gap-2.5 transition-all duration-500 overflow-hidden',
                      addedToCart
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                        : inStock
                          ? 'bg-ayers-ink text-white hover:bg-ayers-ink/90 hover:shadow-xl hover:shadow-ayers-ink/15'
                          : 'bg-ayers-ink/8 text-ayers-ink/25 cursor-not-allowed'
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {addedToCart ? (
                        <motion.span
                          key="added"
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          className="flex items-center gap-2.5"
                        >
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.3, 1] }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                          >
                            <Check size={16} strokeWidth={3} />
                          </motion.span>
                          <span>Added to Cart</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="add"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2.5"
                        >
                          <ShoppingCart size={16} />
                          <span>Add to Cart</span>
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Success ripple */}
                    {addedToCart && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-white"
                      />
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ── Reviews Section ─────────────────────────────────── */}
          {id && <ReviewsSection productId={id} />}
        </div>
      </div>
    </>
  );
}
