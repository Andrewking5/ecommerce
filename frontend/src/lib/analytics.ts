/**
 * GA4 Analytics module
 * Dynamically loads gtag.js and provides typed e-commerce event helpers.
 * All functions are no-ops when GA is not loaded (dev, no consent, no ID).
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID as string | undefined;

let initialized = false;

export function initGA() {
  if (initialized || !GA_ID || GA_ID.startsWith('G-XXXX') || typeof window === 'undefined') return;

  // Check cookie consent
  const consent = localStorage.getItem('cookie_consent');
  if (consent !== 'accepted') return;

  // Inject gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });

  initialized = true;
}

// ─── Page View ───────────────────────────────────────────────

export function trackPageView(pagePath: string, pageTitle?: string) {
  window.gtag?.('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

// ─── E-commerce Events (GA4 standard) ───────────────────────

interface ProductItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
}

function toGAItem(p: ProductItem) {
  return {
    item_id: p.id,
    item_name: p.name,
    price: p.price,
    item_category: p.category,
    quantity: p.quantity ?? 1,
  };
}

export function trackViewItem(product: ProductItem) {
  window.gtag?.('event', 'view_item', {
    currency: 'TWD',
    value: product.price,
    items: [toGAItem(product)],
  });
}

export function trackAddToCart(product: ProductItem, quantity: number) {
  window.gtag?.('event', 'add_to_cart', {
    currency: 'TWD',
    value: product.price * quantity,
    items: [toGAItem({ ...product, quantity })],
  });
}

export function trackRemoveFromCart(product: ProductItem, quantity: number) {
  window.gtag?.('event', 'remove_from_cart', {
    currency: 'TWD',
    value: product.price * quantity,
    items: [toGAItem({ ...product, quantity })],
  });
}

export function trackBeginCheckout(
  items: ProductItem[],
  value: number,
  coupon?: string
) {
  window.gtag?.('event', 'begin_checkout', {
    currency: 'TWD',
    value,
    coupon,
    items: items.map(toGAItem),
  });
}

export function trackAddShippingInfo(value: number, shippingTier?: string) {
  window.gtag?.('event', 'add_shipping_info', {
    currency: 'TWD',
    value,
    shipping_tier: shippingTier,
  });
}

export function trackAddPaymentInfo(value: number, paymentType: string) {
  window.gtag?.('event', 'add_payment_info', {
    currency: 'TWD',
    value,
    payment_type: paymentType,
  });
}

export function trackPurchase(
  orderId: string,
  value: number,
  tax: number,
  shipping: number,
  items: ProductItem[],
  coupon?: string
) {
  // Guard against duplicate purchase events on page refresh
  const key = `purchase_tracked_${orderId}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  window.gtag?.('event', 'purchase', {
    transaction_id: orderId,
    currency: 'TWD',
    value,
    tax,
    shipping,
    coupon,
    items: items.map(toGAItem),
  });
}
