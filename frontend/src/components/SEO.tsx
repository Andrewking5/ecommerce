import { Helmet } from 'react-helmet-async';
import { useParams, useLocation } from 'react-router-dom';
import { languages } from '@/src/i18n/config';

/* ── Constants ─────────────────────────────────── */

const SITE_NAME = 'Ayers Guitars';
const DOMAIN = 'https://www.ayersguitars.com';
const DEFAULT_DESC = 'Premium handcrafted acoustic guitars from Taiwan since 1996. Featuring Sunwave Acoustic Technology for exceptional tone and resonance.';
const DEFAULT_OG_IMAGE = `${DOMAIN}/images/products/ayers-tech-1.png`;
const DEFAULT_LANG = 'zh-TW';

// Google-compatible hreflang codes
const HREFLANG_MAP: Record<string, string> = {
  'zh-TW': 'zh-Hant-TW',
  'zh-CN': 'zh-Hans-CN',
  en: 'en',
  ja: 'ja',
  vi: 'vi',
};

/* ── Types ─────────────────────────────────────── */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Breadcrumb trail for structured data */
  breadcrumbs?: BreadcrumbItem[];
  /** Disable hreflang for pages that don't have i18n variants (e.g., 404) */
  noHreflang?: boolean;
}

/* ── Component ─────────────────────────────────── */

export default function SEO({
  title,
  description = DEFAULT_DESC,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonicalUrl,
  jsonLd,
  breadcrumbs,
  noHreflang = false,
}: SEOProps) {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const currentLang = lang || DEFAULT_LANG;

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  // Build canonical URL from current path if not provided
  const canonical = canonicalUrl || `${DOMAIN}${location.pathname}`;

  // Build hreflang alternate URLs
  // Replace current lang in path with each alternate lang
  const pathWithoutLang = location.pathname.replace(new RegExp(`^/${currentLang}`), '');

  // Build breadcrumb JSON-LD
  const breadcrumbJsonLd = breadcrumbs && breadcrumbs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `${DOMAIN}${item.url}`,
        })),
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <html lang={currentLang === 'zh-TW' ? 'zh-Hant-TW' : currentLang === 'zh-CN' ? 'zh-Hans-CN' : currentLang} />

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Hreflang alternates — tells Google which language version to show each market */}
      {!noHreflang && languages.map(({ code }) => (
        <link
          key={code}
          rel="alternate"
          hrefLang={HREFLANG_MAP[code]}
          href={`${DOMAIN}/${code}${pathWithoutLang}`}
        />
      ))}
      {!noHreflang && (
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${DOMAIN}/${DEFAULT_LANG}${pathWithoutLang}`}
        />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={currentLang.replace('-', '_')} />
      {ogImage && <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${DOMAIN}${ogImage}`} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${DOMAIN}${ogImage}`} />}

      {/* Breadcrumb JSON-LD */}
      {breadcrumbJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      )}

      {/* Custom JSON-LD (single object or array of schemas) */}
      {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
