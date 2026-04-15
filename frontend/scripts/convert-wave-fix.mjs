import sharp from 'sharp';
import { copyFileSync, existsSync } from 'fs';
import path from 'path';

// 海浪資産編號與其他角色不同：
// 1x/資産 1-26 = 其他角色的資産 2-27（btn-contest 到 text-save）
// 1x/1x/資産 27.png = char-type（其他角色的資産 1）

const SRC_MAIN  = 'C:/Users/anpen/Downloads/drive-download-20260415T113249Z-3-001/海浪/1x';
const SRC_CHAR_TYPE = 'C:/Users/anpen/Downloads/drive-download-20260415T113249Z-3-001/海浪/1x/1x/資產 27.png';
const ANIM_SRC  = 'C:/Users/anpen/Downloads/drive-download-20260415T090350Z-3-001/海浪.webp';
const BG_SRC    = 'C:/Users/anpen/Downloads/drive-download-20260415T113249Z-3-001/海浪/海浪結果圖背景.jpg';
const HERO_SRC  = 'C:/Users/anpen/Downloads/drive-download-20260415T113249Z-3-001/海浪/海浪小卡.jpg';
const FIRE_POSTER = 'C:/Users/anpen/Desktop/ai/ecommerce-main/frontend/public/images/events/quiz/result/fire/poster.webp';
const DST = 'C:/Users/anpen/Desktop/ai/ecommerce-main/frontend/public/images/events/quiz/result/wave';

// 海浪 1x/ 資産 1-26 對應（跟其他角色的 2-27 相同）
const PNG_MAP = [
  ['資產 1.png',  'btn-contest.webp'],
  ['資產 2.png',  'btn-retry.webp'],
  ['資產 3.png',  'btn-share.webp'],
  ['資產 4.png',  'tag-1.webp'],
  ['資產 5.png',  'tag-2.webp'],
  ['資產 6.png',  'tag-3.webp'],
  ['資產 7.png',  'tag-4.webp'],
  ['資產 8.png',  'btn-unlock-1.webp'],
  ['資產 9.png',  'btn-unlock-2.webp'],
  ['資產 10.png', 'guitar-2.webp'],
  ['資產 11.png', 'guitar-1.webp'],
  ['資產 12.png', 'city-card.webp'],
  ['資產 13.png', 'personality-card.webp'],
  ['資產 14.png', 'guitar-title-2.webp'],
  ['資產 15.png', 'guitar-title-1.webp'],
  ['資產 16.png', 'title-music-style.webp'],
  ['資產 17.png', 'title-ayers.webp'],
  ['資產 18.png', 'char-left.webp'],
  ['資產 19.png', 'char-right.webp'],
  ['資產 20.png', 'text-chance.webp'],
  ['資產 21.png', 'text-scroll.webp'],
  ['資產 22.png', 'text-heard.webp'],
  ['資產 23.png', 'text-contest-info.webp'],
  ['資產 24.png', 'text-sound.webp'],
  ['資產 25.png', 'text-guess.webp'],
  ['資產 26.png', 'text-save.webp'],
];

async function main() {
  let ok = 0, fail = 0;

  console.log('▶  海浪 → wave（修正版）');

  for (const [src, dst] of PNG_MAP) {
    const srcPath = path.join(SRC_MAIN, src);
    const dstPath = path.join(DST, dst);
    try {
      await sharp(srcPath).webp({ quality: 90 }).toFile(dstPath);
      const { width, height } = await sharp(srcPath).metadata();
      console.log(`  OK  ${dst}  (${width}x${height})`);
      ok++;
    } catch (e) {
      console.log(`  ERR ${dst}: ${e.message}`);
      fail++;
    }
  }

  // char-type 在 1x/1x/ 裡
  const ctDst = path.join(DST, 'char-type.webp');
  try {
    await sharp(SRC_CHAR_TYPE).webp({ quality: 90 }).toFile(ctDst);
    const { width, height } = await sharp(SRC_CHAR_TYPE).metadata();
    console.log(`  OK  char-type.webp  (${width}x${height})`);
    ok++;
  } catch (e) {
    console.log(`  ERR char-type.webp: ${e.message}`);
    fail++;
  }

  // bg
  try {
    await sharp(BG_SRC).webp({ quality: 85 }).toFile(path.join(DST, 'bg.webp'));
    const { width, height } = await sharp(BG_SRC).metadata();
    console.log(`  OK  bg.webp  (${width}x${height})`);
    ok++;
  } catch (e) { console.log(`  ERR bg.webp: ${e.message}`); fail++; }

  // hero-card
  try {
    await sharp(HERO_SRC).webp({ quality: 90 }).toFile(path.join(DST, 'hero-card.webp'));
    const { width, height } = await sharp(HERO_SRC).metadata();
    console.log(`  OK  hero-card.webp  (${width}x${height})`);
    ok++;
  } catch (e) { console.log(`  ERR hero-card.webp: ${e.message}`); fail++; }

  // char animation
  copyFileSync(ANIM_SRC, path.join(DST, 'char.webp'));
  console.log('  OK  char.webp');
  ok++;

  // poster
  copyFileSync(FIRE_POSTER, path.join(DST, 'poster.webp'));
  console.log('  OK  poster.webp (共用)');
  ok++;

  console.log(`\n完成: ${ok} ok, ${fail} failed`);
}

main().catch(console.error);
