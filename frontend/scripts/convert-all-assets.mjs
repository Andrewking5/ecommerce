import sharp from 'sharp';
import { copyFileSync, existsSync } from 'fs';
import path from 'path';

const SRC_ROOT   = 'C:/Users/anpen/Downloads/drive-download-20260415T113249Z-3-001';
const ANIM_ROOT  = 'C:/Users/anpen/Downloads/drive-download-20260415T090350Z-3-001';
const DST_ROOT   = 'C:/Users/anpen/Desktop/ai/ecommerce-main/frontend/public/images/events/quiz/result';
const FIRE_POSTER = 'C:/Users/anpen/Desktop/ai/ecommerce-main/frontend/public/images/events/quiz/result/fire/poster.webp';

// 27 共用 PNG 資產對應（順序與 fire 一致）
const PNG_MAP = [
  ['資產 1.png',  'char-type.webp'],       // 分享抽獎說明文字
  ['資產 2.png',  'btn-contest.webp'],
  ['資產 3.png',  'btn-retry.webp'],
  ['資產 4.png',  'btn-share.webp'],
  ['資產 5.png',  'tag-1.webp'],
  ['資產 6.png',  'tag-2.webp'],
  ['資產 7.png',  'tag-3.webp'],
  ['資產 8.png',  'tag-4.webp'],
  ['資產 9.png',  'btn-unlock-1.webp'],
  ['資產 10.png', 'btn-unlock-2.webp'],
  ['資產 11.png', 'guitar-2.webp'],        // 右吉他
  ['資產 12.png', 'guitar-1.webp'],        // 左吉他
  ['資產 13.png', 'city-card.webp'],
  ['資產 14.png', 'personality-card.webp'],
  ['資產 15.png', 'guitar-title-2.webp'],
  ['資產 16.png', 'guitar-title-1.webp'],
  ['資產 17.png', 'title-music-style.webp'],
  ['資產 18.png', 'title-ayers.webp'],
  ['資產 19.png', 'char-left.webp'],
  ['資產 20.png', 'char-right.webp'],
  ['資產 21.png', 'text-chance.webp'],
  ['資產 22.png', 'text-scroll.webp'],
  ['資產 23.png', 'text-heard.webp'],
  ['資產 24.png', 'text-contest-info.webp'],
  ['資產 25.png', 'text-sound.webp'],
  ['資產 26.png', 'text-guess.webp'],
  ['資產 27.png', 'text-save.webp'],       // 海浪沒有此檔，會跳過
];

const CHARACTERS = [
  {
    name:     '夢月',
    slug:     'dream-moon',
    animFile: '夢月.webp',
    bgFile:   '夢月純背景.jpg',
    heroFile: '夢月小卡.jpg',
  },
  {
    name:     '太陽',
    slug:     'sun',
    animFile: '太陽.webp',
    bgFile:   '太陽純背景圖.jpg',
    heroFile: '太陽牌.png',
  },
  {
    name:     '微光',
    slug:     'glow',
    animFile: '微光.webp',
    bgFile:   '微光純背景.jpg',
    heroFile: '微光小卡.jpg',
  },
  {
    name:     '月光',
    slug:     'moon',
    animFile: '月亮.webp',           // 月光角色用月亮.webp
    bgFile:   '月光純背景圖.jpg',
    heroFile: '月光小卡.jpg',
  },
  {
    name:     '海浪',
    slug:     'wave',
    animFile: '海浪.webp',
    bgFile:   '海浪結果圖背景.jpg',
    heroFile: '海浪小卡.jpg',
  },
  {
    name:     '深海',
    slug:     'deep-sea',
    animFile: '深海.webp',
    bgFile:   '深海結果圖背景.jpg',
    heroFile: '深海小卡.jpg',
  },
  {
    name:     '煙火',
    slug:     'fireworks',
    animFile: '煙火.webp',
    bgFile:   '煙火 背景.jpg',
    heroFile: '煙火小卡.jpg',
  },
];

async function convertChar(char) {
  const { name, slug, animFile, bgFile, heroFile } = char;
  const srcDir = path.join(SRC_ROOT, name, '1x');
  const dstDir = path.join(DST_ROOT, slug);
  let ok = 0, fail = 0;

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`▶  ${name} → ${slug}`);
  console.log('─'.repeat(50));

  // 1. 27 個 PNG 資產
  for (const [src, dst] of PNG_MAP) {
    const srcPath = path.join(srcDir, src);
    const dstPath = path.join(dstDir, dst);
    if (!existsSync(srcPath)) {
      console.log(`  SKIP  ${dst}  (${src} 不存在)`);
      continue;
    }
    try {
      await sharp(srcPath).webp({ quality: 90, lossless: false }).toFile(dstPath);
      const { width, height } = await sharp(srcPath).metadata();
      console.log(`  OK    ${dst}  (${width}x${height})`);
      ok++;
    } catch (e) {
      console.log(`  ERR   ${dst}: ${e.message}`);
      fail++;
    }
  }

  // 2. 背景
  const bgSrc = path.join(SRC_ROOT, name, bgFile);
  const bgDst = path.join(dstDir, 'bg.webp');
  if (existsSync(bgSrc)) {
    try {
      await sharp(bgSrc).webp({ quality: 85 }).toFile(bgDst);
      const { width, height } = await sharp(bgSrc).metadata();
      console.log(`  OK    bg.webp  (${width}x${height})`);
      ok++;
    } catch (e) {
      console.log(`  ERR   bg.webp: ${e.message}`);
      fail++;
    }
  } else {
    console.log(`  MISS  bg.webp  (${bgFile})`);
    fail++;
  }

  // 3. Hero card
  const heroSrc = path.join(SRC_ROOT, name, heroFile);
  const heroDst = path.join(dstDir, 'hero-card.webp');
  if (existsSync(heroSrc)) {
    try {
      await sharp(heroSrc).webp({ quality: 90 }).toFile(heroDst);
      const { width, height } = await sharp(heroSrc).metadata();
      console.log(`  OK    hero-card.webp  (${width}x${height})`);
      ok++;
    } catch (e) {
      console.log(`  ERR   hero-card.webp: ${e.message}`);
      fail++;
    }
  } else {
    console.log(`  MISS  hero-card.webp  (${heroFile})`);
    fail++;
  }

  // 4. 動畫角色 char.webp
  const animSrc = path.join(ANIM_ROOT, animFile);
  const animDst = path.join(dstDir, 'char.webp');
  if (existsSync(animSrc)) {
    copyFileSync(animSrc, animDst);
    console.log(`  OK    char.webp  (from ${animFile})`);
    ok++;
  } else {
    console.log(`  MISS  char.webp  (${animFile})`);
    fail++;
  }

  // 5. 海報 — 共用火焰海報
  const posterDst = path.join(dstDir, 'poster.webp');
  if (existsSync(FIRE_POSTER)) {
    copyFileSync(FIRE_POSTER, posterDst);
    console.log(`  OK    poster.webp  (共用火焰海報)`);
    ok++;
  } else {
    console.log(`  MISS  poster.webp  (fire poster not found)`);
    fail++;
  }

  console.log(`  結果: ${ok} ok, ${fail} failed`);
  return { ok, fail };
}

async function main() {
  let totalOk = 0, totalFail = 0;
  for (const char of CHARACTERS) {
    const { ok, fail } = await convertChar(char);
    totalOk += ok;
    totalFail += fail;
  }
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`全部完成：${totalOk} ok, ${totalFail} failed`);
}

main().catch(console.error);
