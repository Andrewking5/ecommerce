/**
 * Post-build: inject event-specific OG / Twitter meta tags
 *
 * Social media crawlers (LINE, FB, Twitter…) don't execute JavaScript, so
 * react-helmet meta tags are invisible to them. This script runs after
 * `vite build` and writes per-event index.html files into dist/ with the
 * correct Open Graph tags baked in.
 *
 * Vercel serves static files BEFORE applying the catch-all rewrite, so
 *   dist/e/soul-guitar/index.html        → /e/soul-guitar
 *   dist/e/soul-guitar/info/index.html   → /e/soul-guitar/info
 * will be served directly with proper previews.
 *
 * Usage: tsx scripts/inject-event-og.ts   (runs automatically via postbuild)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const DOMAIN = 'https://ayers.vercel.app';
const POSTER = `${DOMAIN}/images/events/soul-guitar-poster.webp`;
const RESULT_IMG = (folder: string) =>
  `${DOMAIN}/images/events/quiz/result/${folder}/hero-card.webp`;

interface EventMeta {
  /** URL path without leading slash, e.g. "e/soul-guitar/info" */
  urlPath: string;
  title: string;
  description: string;
  image: string;
}

const EVENTS: EventMeta[] = [
  {
    urlPath: 'e/soul-guitar',
    title: '2026 Ayers 靈魂吉他手大賽 | 測出你的吉他靈魂',
    description: '7道問題，找出你的靈魂吉他色！完成心理測驗，報名參加年度吉他大賽，總獎項價值超過 NT$200,000。',
    image: POSTER,
  },
  {
    urlPath: 'e/soul-guitar/info',
    title: '2026 Ayers 靈魂吉他手大賽 | 活動簡章',
    description: '大聲點，讓世界聽見你的聲音！拿起手中那一把吉他，展現你的靈魂性格。獎項總價值超過 NT$200,000！',
    image: POSTER,
  },
  {
    urlPath: 'e/soul-guitar/register',
    title: '2026 Ayers 靈魂吉他手大賽 | 立即報名',
    description: '報名上限 200 位，額滿為止！拿起手中那一把吉他，展現你的靈魂性格。獎項總價值超過 NT$200,000！',
    image: POSTER,
  },
  // ── 結果頁（8種）──
  {
    urlPath: 'e/soul-guitar/result/fire',
    title: '我的吉他靈魂是「火焰吉他靈魂」！| 2026 Ayers 靈魂吉他手大賽',
    description: '你是一個很有行動力的人，想到什麼就會立刻去做。快來測測你的吉他靈魂！',
    image: RESULT_IMG('fire'),
  },
  {
    urlPath: 'e/soul-guitar/result/fireworks',
    title: '我的吉他靈魂是「煙火吉他靈魂」！| 2026 Ayers 靈魂吉他手大賽',
    description: '你有很多想法，也很容易把感受變成表達。快來測測你的吉他靈魂！',
    image: RESULT_IMG('fireworks'),
  },
  {
    urlPath: 'e/soul-guitar/result/sun',
    title: '我的吉他靈魂是「太陽吉他靈魂」！| 2026 Ayers 靈魂吉他手大賽',
    description: '你給人的感覺自然、輕鬆，很容易讓人放下防備。快來測測你的吉他靈魂！',
    image: RESULT_IMG('sun'),
  },
  {
    urlPath: 'e/soul-guitar/result/glow',
    title: '我的吉他靈魂是「微光吉他靈魂」！| 2026 Ayers 靈魂吉他手大賽',
    description: '你細膩、溫柔，也很懂得理解別人的感受。快來測測你的吉他靈魂！',
    image: RESULT_IMG('glow'),
  },
  {
    urlPath: 'e/soul-guitar/result/wave',
    title: '我的吉他靈魂是「海浪吉他靈魂」！| 2026 Ayers 靈魂吉他手大賽',
    description: '你喜歡空間、變化和自由感，不太喜歡被固定模式困住。快來測測你的吉他靈魂！',
    image: RESULT_IMG('wave'),
  },
  {
    urlPath: 'e/soul-guitar/result/deep-sea',
    title: '我的吉他靈魂是「深海吉他靈魂」！| 2026 Ayers 靈魂吉他手大賽',
    description: '你是一個很有內在世界的人，很會觀察，也很容易注意到細節與情緒。快來測測你的吉他靈魂！',
    image: RESULT_IMG('deep-sea'),
  },
  {
    urlPath: 'e/soul-guitar/result/moon',
    title: '我的吉他靈魂是「月光吉他靈魂」！| 2026 Ayers 靈魂吉他手大賽',
    description: '你是一個很習慣向內思考的人，習慣先觀察、先思考，再慢慢表達自己。快來測測你的吉他靈魂！',
    image: RESULT_IMG('moon'),
  },
  {
    urlPath: 'e/soul-guitar/result/dream-moon',
    title: '我的吉他靈魂是「夢月吉他靈魂」！| 2026 Ayers 靈魂吉他手大賽',
    description: '你感受力很強，也很容易被一段旋律或一個畫面打動。快來測測你的吉他靈魂！',
    image: RESULT_IMG('dream-moon'),
  },
];

function replace(html: string, attr: string, value: string): string {
  // Handles both single and double quotes, content may contain spaces
  return html.replace(
    new RegExp(`(${escapeRe(attr)}\\s+content=)["'][^"']*["']`, 'i'),
    `$1"${value}"`,
  );
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function injectOgTags(html: string, event: EventMeta): string {
  const fullUrl = `${DOMAIN}/${event.urlPath}`;

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${event.title}</title>`);

  // Standard meta
  html = replace(html, 'name="description"', event.description);

  // Open Graph
  html = replace(html, 'property="og:title"', event.title);
  html = replace(html, 'property="og:description"', event.description);
  html = replace(html, 'property="og:image"', event.image);
  html = replace(html, 'property="og:url"', fullUrl);

  // Twitter Card
  html = replace(html, 'name="twitter:title"', event.title);
  html = replace(html, 'name="twitter:description"', event.description);
  html = replace(html, 'name="twitter:image"', event.image);

  // Canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/i,
    `<link rel="canonical" href="${fullUrl}"`,
  );

  return html;
}

const templatePath = path.join(distDir, 'index.html');
if (!fs.existsSync(templatePath)) {
  console.error('✗ dist/index.html not found — run `vite build` first');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf-8');

for (const event of EVENTS) {
  const modified = injectOgTags(template, event);
  const outDir = path.join(distDir, event.urlPath);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), modified);
  console.log(`✓ dist/${event.urlPath}/index.html`);
}

console.log('✓ Event OG tags injected.');
