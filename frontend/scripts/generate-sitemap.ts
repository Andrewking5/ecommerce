/**
 * Static sitemap.xml generator for Ayers Guitars
 *
 * Generates a sitemap with all public routes across all 5 languages,
 * including proper hreflang xhtml:link annotations for each page.
 *
 * Usage: npx tsx scripts/generate-sitemap.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://www.ayersguitars.com';
const OUTPUT_PATH = path.resolve(__dirname, '../public/sitemap.xml');

const LANGUAGES = ['zh-TW', 'zh-CN', 'en', 'ja', 'vi'];
const DEFAULT_LANG = 'zh-TW';

// hreflang codes (Google format — differs from URL slugs)
const HREFLANG_MAP: Record<string, string> = {
  'zh-TW': 'zh-Hant-TW',
  'zh-CN': 'zh-Hans-CN',
  'en': 'en',
  'ja': 'ja',
  'vi': 'vi',
};

interface Route {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
}

// All public (crawlable) routes — exclude account, admin, checkout, login
const PUBLIC_ROUTES: Route[] = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/collections', changefreq: 'daily', priority: 0.9 },
  { path: '/customizer', changefreq: 'monthly', priority: 0.8 },
  { path: '/community', changefreq: 'weekly', priority: 0.7 },
  { path: '/store-locator', changefreq: 'monthly', priority: 0.7 },
  { path: '/technology', changefreq: 'monthly', priority: 0.7 },
  { path: '/about', changefreq: 'monthly', priority: 0.6 },
  { path: '/support', changefreq: 'monthly', priority: 0.5 },
  { path: '/contact', changefreq: 'monthly', priority: 0.5 },
  { path: '/warranty', changefreq: 'yearly', priority: 0.4 },
  { path: '/shipping', changefreq: 'yearly', priority: 0.4 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { path: '/terms', changefreq: 'yearly', priority: 0.3 },
];

function buildUrl(lang: string, routePath: string): string {
  const suffix = routePath === '/' ? '' : routePath;
  return `${DOMAIN}/${lang}${suffix}`;
}

function generateSitemap(): string {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
`;

  for (const route of PUBLIC_ROUTES) {
    for (const lang of LANGUAGES) {
      const loc = buildUrl(lang, route.path);

      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority.toFixed(1)}</priority>\n`;

      // Add hreflang alternates for all languages
      for (const altLang of LANGUAGES) {
        const altLoc = buildUrl(altLang, route.path);
        xml += `    <xhtml:link rel="alternate" hreflang="${HREFLANG_MAP[altLang]}" href="${altLoc}" />\n`;
      }

      // x-default points to the default language version
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(DEFAULT_LANG, route.path)}" />\n`;

      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>\n`;
  return xml;
}

// Generate and write
const sitemap = generateSitemap();
fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf-8');

const urlCount = PUBLIC_ROUTES.length * LANGUAGES.length;
console.log(`✅ Sitemap generated: ${urlCount} URLs (${PUBLIC_ROUTES.length} routes × ${LANGUAGES.length} languages)`);
console.log(`📄 Output: ${path.relative(process.cwd(), OUTPUT_PATH)}`);
