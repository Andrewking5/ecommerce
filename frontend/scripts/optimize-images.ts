/**
 * Build-time image optimization script for Ayers Guitars
 *
 * Processes all images in public/images/ and generates:
 * - WebP versions at multiple breakpoints (640, 960, 1280, 1920)
 * - AVIF versions at multiple breakpoints
 * - Tiny 20px LQIP (Low Quality Image Placeholder) as base64
 * - A manifest JSON mapping original paths → optimized variants
 *
 * Usage: npx tsx scripts/optimize-images.ts
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ── Config ────────────────────────────────────── */

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'images-opt');
const MANIFEST_PATH = path.resolve(__dirname, '../src/image-manifest.json');

const WIDTHS = [640, 960, 1280, 1920]; // responsive breakpoints
const LQIP_WIDTH = 20; // blur placeholder width

const WEBP_QUALITY = 80;
const AVIF_QUALITY = 65;
const JPEG_QUALITY = 80;

// Skip SVGs (already optimized vector) and very small images
const SUPPORTED_EXTS = ['.png', '.jpg', '.jpeg'];

// Skip images smaller than 5KB (icons, tiny decorative elements)
const MIN_SIZE_BYTES = 5 * 1024;

/* ── Helpers ───────────────────────────────────── */

interface ImageVariant {
  width: number;
  webp: string;
  avif: string;
}

interface ManifestEntry {
  original: string;
  width: number;
  height: number;
  lqip: string; // base64 data URI
  variants: ImageVariant[];
}

type Manifest = Record<string, ManifestEntry>;

function getAllImages(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllImages(full));
    } else if (SUPPORTED_EXTS.includes(path.extname(entry.name).toLowerCase())) {
      const stat = fs.statSync(full);
      if (stat.size >= MIN_SIZE_BYTES) {
        results.push(full);
      }
    }
  }
  return results;
}

function toPublicPath(absPath: string): string {
  return '/' + path.relative(PUBLIC_DIR, absPath).replace(/\\/g, '/');
}

function toOptPath(originalPublicPath: string, width: number, ext: string): string {
  // /images/products/wave/d09-wave-front.png → /images-opt/products/wave/d09-wave-front-960.webp
  const rel = originalPublicPath.replace(/^\/images\//, '');
  const parsed = path.parse(rel);
  return `/images-opt/${parsed.dir}/${parsed.name}-${width}${ext}`.replace(/\\/g, '/');
}

async function processImage(
  filePath: string,
  manifest: Manifest,
  stats: { processed: number; skipped: number; errors: number }
): Promise<void> {
  const publicPath = toPublicPath(filePath);

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      stats.skipped++;
      return;
    }

    const origWidth = metadata.width;
    const origHeight = metadata.height;

    // Generate LQIP (tiny blur placeholder)
    const lqipBuffer = await sharp(filePath)
      .resize(LQIP_WIDTH)
      .webp({ quality: 20 })
      .toBuffer();
    const lqip = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;

    const variants: ImageVariant[] = [];

    // Generate responsive variants
    for (const w of WIDTHS) {
      // Skip widths larger than original (no upscaling)
      if (w > origWidth) continue;

      const webpPath = toOptPath(publicPath, w, '.webp');
      const avifPath = toOptPath(publicPath, w, '.avif');

      const webpAbsPath = path.join(PUBLIC_DIR, webpPath);
      const avifAbsPath = path.join(PUBLIC_DIR, avifPath);

      // Ensure output directory exists
      fs.mkdirSync(path.dirname(webpAbsPath), { recursive: true });

      // Skip if already generated (incremental builds)
      const srcMtime = fs.statSync(filePath).mtimeMs;
      const webpExists = fs.existsSync(webpAbsPath);
      const avifExists = fs.existsSync(avifAbsPath);

      if (webpExists && avifExists) {
        const webpMtime = fs.statSync(webpAbsPath).mtimeMs;
        if (webpMtime > srcMtime) {
          variants.push({ width: w, webp: webpPath, avif: avifPath });
          continue; // Already up-to-date
        }
      }

      // Generate WebP
      await sharp(filePath)
        .resize(w)
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpAbsPath);

      // Generate AVIF
      await sharp(filePath)
        .resize(w)
        .avif({ quality: AVIF_QUALITY })
        .toFile(avifAbsPath);

      variants.push({ width: w, webp: webpPath, avif: avifPath });
    }

    // Always include the largest available width variant (at original size if not in WIDTHS)
    const maxWidth = WIDTHS.filter(w => w <= origWidth);
    if (maxWidth.length === 0 || maxWidth[maxWidth.length - 1] < origWidth) {
      const w = origWidth;
      const webpPath = toOptPath(publicPath, w, '.webp');
      const avifPath = toOptPath(publicPath, w, '.avif');
      const webpAbsPath = path.join(PUBLIC_DIR, webpPath);
      const avifAbsPath = path.join(PUBLIC_DIR, avifPath);

      fs.mkdirSync(path.dirname(webpAbsPath), { recursive: true });

      const srcMtime = fs.statSync(filePath).mtimeMs;
      const webpExists = fs.existsSync(webpAbsPath);

      if (!(webpExists && fs.statSync(webpAbsPath).mtimeMs > srcMtime)) {
        await sharp(filePath)
          .resize(w)
          .webp({ quality: WEBP_QUALITY })
          .toFile(webpAbsPath);

        await sharp(filePath)
          .resize(w)
          .avif({ quality: AVIF_QUALITY })
          .toFile(avifAbsPath);
      }

      variants.push({ width: w, webp: webpPath, avif: avifPath });
    }

    // Sort variants by width
    variants.sort((a, b) => a.width - b.width);

    manifest[publicPath] = {
      original: publicPath,
      width: origWidth,
      height: origHeight,
      lqip,
      variants,
    };

    stats.processed++;
  } catch (err) {
    console.error(`  ✗ Error processing ${publicPath}:`, (err as Error).message);
    stats.errors++;
  }
}

/* ── Main ──────────────────────────────────────── */

async function main() {
  console.log('🖼️  Ayers Guitars Image Optimizer');
  console.log('─'.repeat(50));

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌ Images directory not found:', IMAGES_DIR);
    process.exit(1);
  }

  const images = getAllImages(IMAGES_DIR);
  console.log(`Found ${images.length} images to process\n`);

  // Load existing manifest for incremental builds
  let manifest: Manifest = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
      console.log(`Loaded existing manifest (${Object.keys(manifest).length} entries)\n`);
    } catch {
      manifest = {};
    }
  }

  const stats = { processed: 0, skipped: 0, errors: 0 };
  const concurrency = 4; // Process 4 images at a time

  for (let i = 0; i < images.length; i += concurrency) {
    const batch = images.slice(i, i + concurrency);
    await Promise.all(
      batch.map(img => {
        const pub = toPublicPath(img);
        process.stdout.write(`  [${i + 1}/${images.length}] ${pub}\r`);
        return processImage(img, manifest, stats);
      })
    );
  }

  // Write manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log('\n');
  console.log('─'.repeat(50));
  console.log(`✅ Processed: ${stats.processed}`);
  console.log(`⏭️  Skipped:   ${stats.skipped}`);
  console.log(`❌ Errors:    ${stats.errors}`);
  console.log(`📄 Manifest:  ${path.relative(process.cwd(), MANIFEST_PATH)}`);

  // Show size comparison
  const originalSize = images.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  let optimizedSize = 0;
  if (fs.existsSync(OUTPUT_DIR)) {
    const optFiles = getAllOptFiles(OUTPUT_DIR);
    optimizedSize = optFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  }

  console.log(`\n📊 Size comparison:`);
  console.log(`   Original:  ${(originalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Optimized: ${(optimizedSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Saved:     ${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`);
}

function getAllOptFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllOptFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
