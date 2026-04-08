/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
// import ChatWidget from './components/ChatWidget';
import ErrorBoundary from './components/ErrorBoundary';

import { isSupportedLang, useStrippedLocation } from './lib/i18nRouting';
import { usePageViewTracking } from './hooks/useAnalytics';
import { FullPageLoader } from './components/guitar';
import i18n from './i18n/config';

// Eagerly load the home page for fast initial render
import Home from './pages/Home';

// Lazy-load all other pages for code splitting
const Collections = lazy(() => import('./pages/Collections'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Customizer = lazy(() => import('./pages/Customizer'));
const Community = lazy(() => import('./pages/Community'));
const StoreLocator = lazy(() => import('./pages/StoreLocator'));
const Support = lazy(() => import('./pages/Support'));
const Account = lazy(() => import('./pages/Account'));
const Admin = lazy(() => import('./pages/Admin'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Technology = lazy(() => import('./pages/Technology'));
const Login = lazy(() => import('./pages/Login'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Warranty = lazy(() => import('./pages/Warranty'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));

function PageLoader() {
  return <FullPageLoader size={48} />;
}

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="../login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="../login" replace />;
  }

  return <>{children}</>;
}

/**
 * Sync i18n language with the :lang URL parameter.
 */
function LanguageSync() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && isSupportedLang(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return null;
}

/** Track GA4 page views on route changes */
function PageViewTracker() {
  usePageViewTracking();
  return null;
}

/**
 * Redirect root `/` to `/:detectedLang/`
 */
function RootRedirect() {
  const { i18n } = useTranslation();
  const lang = isSupportedLang(i18n.language) ? i18n.language : 'zh-TW';
  return <Navigate to={`/${lang}`} replace />;
}

/**
 * Standalone layout for /e/:slug event landing pages.
 * Forces zh-TW language and renders full site chrome.
 */
function EventLandingLayout() {
  useEffect(() => {
    if (i18n.language !== 'zh-TW') i18n.changeLanguage('zh-TW');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main-content" role="main" className="flex-grow pt-20">
        <Suspense fallback={<PageLoader />}>
          <EventDetail />
        </Suspense>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}

function AppLayout() {
  const location = useStrippedLocation();
  const isFullscreen = location.pathname === '/customizer';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-ayers-ink focus:text-white focus:px-6 focus:py-3 focus:rounded-xl focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>
      <LanguageSync />
      <PageViewTracker />
      <Navbar />
      <main id="main-content" role="main" className={isFullscreen ? 'flex-grow' : 'flex-grow pt-20'}>
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="collections" element={<Collections />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="customizer" element={<Customizer />} />
            <Route path="community" element={<Community />} />
            <Route path="store-locator" element={<StoreLocator />} />
            <Route path="support" element={<Support />} />
            <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="checkout/success" element={<CheckoutSuccess />} />
            <Route path="orders/:id/tracking" element={<OrderTracking />} />
            <Route path="technology" element={<Technology />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="warranty" element={<Warranty />} />
            <Route path="shipping" element={<Shipping />} />
            <Route path="contact" element={<Contact />} />
            <Route path="about" element={<About />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:slug" element={<EventDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      {!isFullscreen && <Footer />}
      <CookieConsent />
      {/* <ChatWidget /> */}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <Router>
            <Routes>
              {/* Root → redirect to detected language */}
              <Route path="/" element={<RootRedirect />} />
              {/* OAuth callback — outside /:lang/ because backend redirects to /auth/callback */}
              <Route path="/auth/callback" element={<Suspense fallback={<PageLoader />}><AuthCallback /></Suspense>} />
              {/* Short event landing page — /e/*, no language prefix, supports slashes in slug */}
              <Route path="/e/*" element={<EventLandingLayout />} />
              {/* All pages under /:lang/ */}
              <Route path="/:lang/*" element={<AppLayout />} />
            </Routes>
          </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
    </ErrorBoundary>
  );
}
