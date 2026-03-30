import { useLocation } from 'react-router-dom';
import { Search, User, ShoppingCart, Shield, Mail, X as XIcon } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { useCartContext } from '@/src/contexts/CartContext';
import { LocalizedLink, useLocalizedNavigate, useStrippedLocation } from '@/src/lib/i18nRouting';
import LanguageSwitcher from './LanguageSwitcher';
import { AyersLogo } from './AyersLogo';
import api from '@/src/services/api';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const rawLocation = useLocation();
  const location = useStrippedLocation();
  const navigate = useLocalizedNavigate();
  const isDark = location.pathname === '/customizer' || location.pathname === '/admin';

  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [verifyBannerDismissed, setVerifyBannerDismissed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const showVerifyBanner = isAuthenticated && user && user.emailVerified === false && !verifyBannerDismissed;
  const { itemCount: totalItems } = useCartContext();

  const navLinks = [
    { name: t('nav.series'), href: '/collections' },
    { name: t('nav.customLab'), href: '/customizer' },
    { name: t('nav.artists'), href: '/community' },
    { name: t('nav.storeLocator'), href: '/store-locator' },
    { name: t('nav.about'), href: '/about' },
  ];

  const isAdmin = user?.role === 'ADMIN';

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
    // Double rAF to ensure DOM is painted before triggering CSS transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsMenuVisible(true));
    });
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuVisible(false);
    const timer = setTimeout(() => setIsMenuOpen(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = useCallback(() => {
    if (isMenuOpen) closeMenu();
    else openMenu();
  }, [isMenuOpen, openMenu, closeMenu]);

  // Lock body scroll
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuVisible(false);
      setTimeout(() => setIsMenuOpen(false), 300);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawLocation.pathname]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  /* ─── Mobile overlay (portalled to body so it escapes nav stacking context) ─── */
  const mobileOverlay = isMenuOpen
    ? createPortal(
        <div
          className={cn(
            "md:hidden fixed inset-0 z-[100] bg-ayers-dark overflow-hidden",
            "transition-[clip-path] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]",
            isMenuVisible
              ? "clip-path-[inset(0_0_0_0)]"
              : "clip-path-[inset(0_0_100%_0)]"
          )}
          style={{
            clipPath: isMenuVisible ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
          }}
        >
          {/* Noise texture overlay */}
          <div className="absolute inset-0 bg-noise pointer-events-none" />

          {/* Guitar sun watermark — center right, slow spin */}
          <img
            src="/images/ayers/guitar-sun.png"
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute top-1/2 -translate-y-1/2 right-[-2rem] w-64 h-64 object-contain pointer-events-none select-none transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200",
              isMenuVisible ? "opacity-[0.035] animate-[spin_60s_linear_infinite]" : "opacity-0"
            )}
          />

          {/* Rosette watermark — bottom left */}
          <img
            src="/images/ayers/ring-border.png"
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute -bottom-20 -left-20 w-72 h-72 object-contain pointer-events-none select-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300",
              isMenuVisible ? "opacity-[0.04] -rotate-12" : "opacity-0 rotate-0"
            )}
          />

          {/* Top bar: logo + close button */}
          <div className="relative z-10 flex items-center justify-between h-20 px-6">
            <AyersLogo className="w-24 h-auto text-white" animate={false} />
            <button
              onClick={closeMenu}
              className="w-10 h-10 flex items-center justify-center"
              aria-label="Close menu"
            >
              <div className="w-6 h-5 relative flex flex-col justify-center">
                <span className="block h-[2px] w-full rounded-full bg-white rotate-45 absolute" />
                <span className="block h-[2px] w-full rounded-full bg-white -rotate-45 absolute" />
              </div>
            </button>
          </div>

          {/* Gold accent line */}
          <div
            className={cn(
              "relative z-10 h-px mx-6 bg-gradient-to-r from-transparent via-ayers-gold/40 to-transparent transition-all duration-700 delay-200",
              isMenuVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col px-8 pt-8 pb-12 overflow-y-auto" style={{ height: 'calc(100dvh - 5.5rem)' }}>
            {/* Nav links */}
            <nav className="space-y-1">
              {navLinks.map((link, i) => (
                <div
                  key={link.name}
                  className={cn(
                    "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isMenuVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  )}
                  style={{ transitionDelay: isMenuVisible ? `${150 + i * 70}ms` : '0ms' }}
                >
                  <LocalizedLink
                    to={link.href}
                    onClick={closeMenu}
                    className="group flex items-center py-4 border-b border-white/[0.06]"
                  >
                    <span className="text-[10px] font-mono text-ayers-gold/60 w-8 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        "text-2xl font-light tracking-wide text-white/90 group-hover:text-ayers-gold transition-colors duration-300",
                        location.pathname === link.href && "text-ayers-gold"
                      )}
                    >
                      {link.name}
                    </span>
                    {location.pathname === link.href && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-ayers-gold" />
                    )}
                  </LocalizedLink>
                </div>
              ))}
              {isAdmin && (
                <div
                  className={cn(
                    "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isMenuVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  )}
                  style={{ transitionDelay: isMenuVisible ? `${150 + navLinks.length * 70}ms` : '0ms' }}
                >
                  <LocalizedLink
                    to="/admin"
                    onClick={closeMenu}
                    className="group flex items-center py-4 border-b border-white/[0.06]"
                  >
                    <span className="text-[10px] font-mono text-ayers-gold/60 w-8 tabular-nums">
                      {String(navLinks.length + 1).padStart(2, '0')}
                    </span>
                    <Shield size={18} className="text-white/60 mr-2" />
                    <span
                      className={cn(
                        "text-2xl font-light tracking-wide text-white/90 group-hover:text-ayers-gold transition-colors duration-300",
                        location.pathname === '/admin' && "text-ayers-gold"
                      )}
                    >
                      {t('nav.admin')}
                    </span>
                  </LocalizedLink>
                </div>
              )}
            </nav>

          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
          isDark
            ? "bg-ayers-dark text-white border-b border-white/10"
            : "bg-ayers-cream/80 backdrop-blur-md text-ayers-ink border-b border-ayers-ink/10"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <LocalizedLink to="/" className="flex-shrink-0 flex items-center">
              <AyersLogo className={cn("w-24 h-auto", isDark ? "text-white" : "text-ayers-ink")} animate={false} />
            </LocalizedLink>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <LocalizedLink
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium tracking-wide uppercase hover:opacity-100 transition-opacity",
                    location.pathname === link.href ? "opacity-100 border-b border-current" : "opacity-60"
                  )}
                >
                  {link.name}
                </LocalizedLink>
              ))}
              {isAdmin && (
                <LocalizedLink
                  to="/admin"
                  className={cn(
                    "text-sm font-medium tracking-wide uppercase hover:opacity-100 transition-opacity flex items-center space-x-1",
                    location.pathname === '/admin' ? "opacity-100 border-b border-current" : "opacity-60"
                  )}
                >
                  <Shield size={14} />
                  <span>{t('nav.admin')}</span>
                </LocalizedLink>
              )}
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center space-x-6">
              <LanguageSwitcher isDark={isDark} />
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={cn("hover:opacity-70 transition-opacity", isSearchOpen && "text-ayers-gold opacity-100")}
                aria-label="Toggle search"
              >
                <Search size={20} />
              </button>
              {isAuthenticated ? (
                <LocalizedLink to="/account" className="hover:opacity-70 transition-opacity relative">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                        isDark ? "bg-white/20 text-white" : "bg-ayers-ink/10 text-ayers-ink"
                      )}
                    >
                      {user?.firstName?.charAt(0)?.toUpperCase() || <User size={16} />}
                    </div>
                  )}
                </LocalizedLink>
              ) : (
                <LocalizedLink to="/login" className="hover:opacity-70 transition-opacity">
                  <User size={20} />
                </LocalizedLink>
              )}
              <LocalizedLink to="/checkout" className="hover:opacity-70 transition-opacity relative">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-ayers-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </LocalizedLink>
            </div>

            {/* Mobile icons + hamburger */}
            <div className="md:hidden flex items-center space-x-3">
              <LanguageSwitcher isDark={isDark} />
              {isAuthenticated ? (
                <LocalizedLink to="/account" className="p-2 hover:opacity-70 transition-opacity">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                        isDark ? "bg-white/20 text-white" : "bg-ayers-ink/10 text-ayers-ink"
                      )}
                    >
                      {user?.firstName?.charAt(0)?.toUpperCase() || <User size={14} />}
                    </div>
                  )}
                </LocalizedLink>
              ) : (
                <LocalizedLink to="/login" className="p-2 hover:opacity-70 transition-opacity">
                  <User size={20} />
                </LocalizedLink>
              )}
              <LocalizedLink to="/checkout" className="relative p-2">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-ayers-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </LocalizedLink>
              {/* Animated hamburger → X */}
              <button
                onClick={toggleMenu}
                className="relative w-10 h-10 flex items-center justify-center"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <span
                    className={cn(
                      "block h-[2px] rounded-full transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] origin-center",
                      isMenuVisible
                        ? "rotate-45 translate-y-[9px] bg-white"
                        : isDark ? "bg-white" : "bg-ayers-ink"
                    )}
                  />
                  <span
                    className={cn(
                      "block h-[2px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]",
                      isMenuVisible
                        ? "opacity-0 scale-x-0"
                        : isDark ? "bg-white opacity-100" : "bg-ayers-ink opacity-100"
                    )}
                  />
                  <span
                    className={cn(
                      "block h-[2px] rounded-full transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] origin-center",
                      isMenuVisible
                        ? "-rotate-45 -translate-y-[9px] bg-white"
                        : isDark ? "bg-white" : "bg-ayers-ink"
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div
            className={cn(
              "absolute top-20 left-0 right-0 border-b shadow-lg animate-in slide-in-from-top duration-200",
              isDark ? "bg-ayers-dark border-white/10" : "bg-ayers-cream border-ayers-ink/10"
            )}
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search
                    className={cn("absolute left-5 top-1/2 -translate-y-1/2", isDark ? "text-white/40" : "text-ayers-ink/30")}
                    size={20}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={t('nav.searchPlaceholder')}
                    className={cn(
                      "w-full py-4 pl-14 pr-24 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-ayers-gold transition-all",
                      isDark
                        ? "bg-white/10 text-white placeholder:text-white/30 border border-white/10"
                        : "bg-white text-ayers-ink placeholder:text-ayers-ink/30 border border-ayers-ink/10"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    <kbd
                      className={cn(
                        "hidden sm:inline-block px-2 py-1 rounded text-[10px] font-mono",
                        isDark ? "bg-white/10 text-white/40" : "bg-ayers-ink/5 text-ayers-ink/40"
                      )}
                    >
                      ESC
                    </kbd>
                    <button
                      type="submit"
                      className="bg-ayers-gold text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all"
                    >
                      {t('nav.search')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </nav>

      {/* Email verification banner */}
      {showVerifyBanner && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-800 text-xs">
              <Mail size={14} />
              <span>{t('verifyEmail.banner', 'Please verify your email address.')}</span>
              <button
                onClick={async () => {
                  setResendLoading(true);
                  try {
                    await api.post('/auth/resend-verification');
                    alert(t('verifyEmail.resent', 'Verification email sent!'));
                  } catch {
                    // Silently fail
                  } finally {
                    setResendLoading(false);
                  }
                }}
                disabled={resendLoading}
                className="font-bold underline hover:text-amber-900 disabled:opacity-50"
              >
                {resendLoading ? '...' : t('verifyEmail.resend', 'Resend')}
              </button>
            </div>
            <button onClick={() => setVerifyBannerDismissed(true)} className="text-amber-600 hover:text-amber-800">
              <XIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile menu overlay — portalled to body */}
      {mobileOverlay}
    </>
  );
}
