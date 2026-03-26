import { forwardRef } from 'react';
import {
  Link as RouterLink,
  useNavigate as useRouterNavigate,
  useParams,
  useLocation,
  type LinkProps,
  type NavigateOptions,
  type To,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { languages } from '@/src/i18n/config';

/** All supported language codes */
export const SUPPORTED_LANGS: string[] = languages.map((l) => l.code);

/** Check if a string is a supported language code */
export function isSupportedLang(lang: string): boolean {
  return SUPPORTED_LANGS.includes(lang);
}

/** Get the current language prefix from URL params */
export function useLanguagePrefix(): string {
  const { lang } = useParams<{ lang: string }>();
  return lang && isSupportedLang(lang) ? lang : 'zh-TW';
}

/** Prepend the language prefix to a path */
export function localizedPath(lang: string, to: To): To {
  if (typeof to === 'string') {
    // Don't prefix external URLs or hash-only links
    if (to.startsWith('http') || to.startsWith('#')) return to;
    // Already prefixed
    if (SUPPORTED_LANGS.some((l) => to.startsWith(`/${l}/`) || to === `/${l}`)) return to;
    // Prepend lang
    const path = to.startsWith('/') ? to : `/${to}`;
    return `/${lang}${path}`;
  }
  // To object form
  if (to.pathname) {
    return { ...to, pathname: localizedPath(lang, to.pathname) as string };
  }
  return to;
}

/**
 * Drop-in replacement for react-router's <Link>.
 * Auto-prepends the current language prefix to `to`.
 */
export const LocalizedLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function LocalizedLink({ to, ...props }, ref) {
    const lang = useLanguagePrefix();
    return <RouterLink ref={ref} to={localizedPath(lang, to)} {...props} />;
  },
);

/**
 * Drop-in replacement for react-router's useNavigate().
 * Auto-prepends the current language prefix.
 */
export function useLocalizedNavigate() {
  const nav = useRouterNavigate();
  const lang = useLanguagePrefix();

  return (to: To | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      nav(to);
    } else {
      nav(localizedPath(lang, to), options);
    }
  };
}

/**
 * Strip the language prefix from a pathname for route matching.
 * e.g. "/en/customizer" → "/customizer"
 */
export function stripLangPrefix(pathname: string): string {
  for (const lang of SUPPORTED_LANGS) {
    if (pathname === `/${lang}` || pathname === `/${lang}/`) return '/';
    if (pathname.startsWith(`/${lang}/`)) return pathname.slice(lang.length + 1);
  }
  return pathname;
}

/**
 * Hook that returns location with the lang prefix stripped from pathname.
 * Useful for route-based conditional logic (isDark, isFullscreen, etc.)
 */
export function useStrippedLocation() {
  const location = useLocation();
  return {
    ...location,
    pathname: stripLangPrefix(location.pathname),
  };
}
