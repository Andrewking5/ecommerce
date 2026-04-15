import sharp from 'sharp';
import { copyFileSync, existsSync } from 'fs';
import path from 'path';

const SRC = 'C:/Users/anpen/Downloads/火焰-20260414T091345Z-3-001/火焰/內容';
const SRC_PARENT = 'C:/Users/anpen/Downloads/火焰-20260414T091345Z-3-001/火焰';
const DST = 'frontend/public/images/events/quiz/result/fire';

// PNG assets mapping: source filename → destination filename
const PNG_MAP = [
  ['資產 2.png',  'btn-contest.webp'],
  ['資產 3.png',  'btn-retry.webp'],
  ['資產 4.png',  'btn-share.webp'],
  ['資產 5.png',  'tag-1.webp'],      // Live Acoustic
  ['資產 6.png',  'tag-2.webp'],      // Blues Guitar
  ['資產 7.png',  'tag-3.webp'],      // Rhythm Guitar
  ['資產 8.png',  'tag-4.webp'],      // Rock Acoustic
  ['資產 9.png',  'btn-unlock-1.webp'],
  ['資產 10.png', 'btn-unlock-2.webp'],
  ['資產 11.png', 'guitar-1.webp'],
  ['資產 12.png', 'guitar-2.webp'],
  ['資產 13.png', 'city-card.webp'],
  ['資產 14.png', 'personality-card.webp'],
  ['資產 15.png', 'fire-icon.webp'],
  ['資產 16.png', 'separator.webp'],
  ['資產 17.png', 'title-music-style.webp'],
  ['資產 18.png', 'title-ayers.webp'],
  ['資產 19.png', 'soul-color-bg.webp'],
  ['資產 20.png', 'soul-color.webp'],
  ['資產 21.png', 'text-chance.webp'],
  ['資產 22.png', 'text-scroll.webp'],
  ['資產 23.png', 'text-heard.webp'],
  ['資產 24.png', 'text-contest-info.webp'],
  ['資產 25.png', 'text-sound.webp'],
  ['資產 26.png', 'text-guess.webp'],
  ['資產 27.png', 'text-save.webp'],
  ['資產 1.png',  'char-type.webp'],  // wide text element
];

async function convert() {
  let ok = 0, fail = 0;

  for (const [src, dst] of PNG_MAP) {
    const srcPath = path.join(SRC, src);
    const dstPath = path.join(DST, dst);
    if (!existsSync(srcPath)) {
      console.log(`MISSING: ${src}`);
      fail++;
      continue;
    }
    try {
      await sharp(srcPath).webp({ quality: 90, lossless: false }).toFile(dstPath);
      const { width, height } = await sharp(srcPath).metadata();
      console.log(`OK  ${dst}  (${width}x${height})`);
      ok++;
    } catch (e) {
      console.log(`ERR ${dst}: ${e.message}`);
      fail++;
    }
  }

  // Convert 海報final.jpg → poster.webp
  const posterSrc = path.join(SRC, '海報final.jpg');
  const posterDst = path.join(DST, 'poster.webp');
  if (existsSync(posterSrc)) {
    try {
      await sharp(posterSrc).webp({ quality: 85 }).toFile(posterDst);
      console.log('OK  poster.webp (from 海報final.jpg)');
      ok++;
    } catch (e) {
      console.log(`ERR poster.webp: ${e.message}`);
      fail++;
    }
  } else {
    console.log('MISSING: 海報final.jpg');
    fail++;
  }

  // Convert background image (1080x7357) → bg.webp
  const bgSrc = path.join(SRC_PARENT, '火焰最終頁面背景.png');
  const bgDst = path.join(DST, 'bg.webp');
  if (existsSync(bgSrc)) {
    try {
      await sharp(bgSrc).webp({ quality: 85 }).toFile(bgDst);
      console.log('OK  bg.webp (from 火焰最終頁面背景.png)');
      ok++;
    } catch (e) {
      console.log(`ERR bg.webp: ${e.message}`);
      fail++;
    }
  } else {
    console.log('MISSING: 火焰最終頁面背景.png');
    fail++;
  }

  // Convert hero card (1080x1920) → hero-card.webp
  const heroSrc = path.join(SRC_PARENT, '火焰最終頁面-02.png');
  const heroDst = path.join(DST, 'hero-card.webp');
  if (existsSync(heroSrc)) {
    try {
      await sharp(heroSrc).webp({ quality: 85 }).toFile(heroDst);
      console.log('OK  hero-card.webp (from 火焰最終頁面-02.png)');
      ok++;
    } catch (e) {
      console.log(`ERR hero-card.webp: ${e.message}`);
      fail++;
    }
  } else {
    console.log('MISSING: 火焰最終頁面-02.png');
    fail++;
  }

  // Copy compressed fire animation as char.webp for result page
  const fireSrc = 'frontend/public/images/events/quiz/loading-火焰.webp';
  const fireDst = path.join(DST, 'char.webp');
  if (existsSync(fireSrc)) {
    copyFileSync(fireSrc, fireDst);
    console.log('OK  char.webp (from loading-火焰.webp)');
    ok++;
  } else {
    console.log('MISSING: loading-火焰.webp for char.webp');
    fail++;
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`);
}

convert().catch(console.error);
