/**
 * SVG 轉 PNG 圖標轉換腳本
 * 使用方式: node scripts/convert-icon.js
 * 
 * 需要先安裝 sharp: npm install --save-dev sharp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputSvg = path.join(__dirname, '../public/app-icon-simple.svg');
const outputPng512 = path.join(__dirname, '../public/app-icon-512x512.png');
const outputPng1024 = path.join(__dirname, '../public/app-icon-1024x1024.png');

async function convertSvgToPng() {
  try {
    console.log('🔄 開始轉換 SVG 到 PNG...\n');

    // 檢查輸入文件是否存在
    if (!fs.existsSync(inputSvg)) {
      console.error('❌ 錯誤: 找不到 SVG 文件:', inputSvg);
      process.exit(1);
    }

    // 轉換為 512x512
    console.log('📐 轉換為 512x512...');
    await sharp(inputSvg)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .png()
      .toFile(outputPng512);
    console.log('✅ 已生成: app-icon-512x512.png\n');

    // 轉換為 1024x1024 (Facebook 要求)
    console.log('📐 轉換為 1024x1024 (Facebook 要求)...');
    await sharp(inputSvg)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .png()
      .toFile(outputPng1024);
    console.log('✅ 已生成: app-icon-1024x1024.png\n');

    console.log('🎉 轉換完成！');
    console.log('\n📁 生成的文件位置:');
    console.log('  - frontend/public/app-icon-512x512.png');
    console.log('  - frontend/public/app-icon-1024x1024.png');
    console.log('\n💡 請使用 app-icon-1024x1024.png 上傳到 Facebook');
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n❌ 錯誤: 找不到 sharp 模組');
      console.log('\n📦 請先安裝 sharp:');
      console.log('   cd frontend');
      console.log('   npm install --save-dev sharp\n');
    } else {
      console.error('❌ 轉換失敗:', error.message);
    }
    process.exit(1);
  }
}

convertSvgToPng();


