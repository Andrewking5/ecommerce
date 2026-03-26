import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 清除舊資料（按依賴順序刪除）
  console.log('🧹 Cleaning existing data...');
  await prisma.review.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productVariantAttribute.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.userBehavior.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.productAttributeTemplate.deleteMany({});
  await prisma.category.deleteMany({});
  console.log('✅ Old data cleaned');

  // 創建管理員用戶
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ayersguitars.com' },
    update: {},
    create: {
      email: 'admin@ayersguitars.com',
      password: adminPassword,
      firstName: 'Ayers',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // 創建測試用戶
  const userPassword = await bcrypt.hash('User123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+886912345678',
      role: 'USER',
    },
  });

  console.log('✅ Test user created:', user.email);

  // 創建商品分類 - Ayers 吉他系列
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'wave-series' },
      update: {},
      create: {
        name: 'Wave Series',
        slug: 'wave-series',
        description: 'WAVE 系列以 Ayers 獨家 Sunwave 聲學技術為核心，結合精選雲杉面板與玫瑰木背側板，打造出溫潤飽滿、投射力強勁的聲音表現。',
        image: '/images/products/wave/a05c-wave-front.png',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'light-series' },
      update: {},
      create: {
        name: 'Light Series',
        slug: 'light-series',
        description: 'LIGHT 系列專為追求輕盈手感與明亮音色的演奏者設計。採用特殊輕量化力木結構，讓吉他擁有更靈敏的面板反應和清透的高頻表現。',
        image: '/images/products/light/l05-light-front.png',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sun-series' },
      update: {},
      create: {
        name: 'Sun Series',
        slug: 'sun-series',
        description: 'SUN 系列是 Ayers 的經典旗艦，以頂級木材與精湛工藝打造。每把琴都展現出深沉有力的低頻、甜美的中頻與閃耀的高頻。',
        image: '/images/products/sun/sj07c-passion-front.png',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'master-series' },
      update: {},
      create: {
        name: 'Master Series',
        slug: 'master-series',
        description: 'MASTER 大師系列是 Ayers 的藝術巔峰之作，每把琴都是獨一無二的藝術品。採用頂級珍稀木材，搭配大師級的貝殼鑲嵌工藝，展現極致的音色與視覺美學。',
        image: '/images/products/master/koi-front.png',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'vintage-series' },
      update: {},
      create: {
        name: 'Vintage Series',
        slug: 'vintage-series',
        description: 'Vintage 經典系列由澳洲製琴大師 Gerard Gilet 設計，採用自然風乾的頂級木材，以傳統工法打造出具有復古韻味的經典音色。限量生產，每把都是珍藏之選。',
        image: '/images/products/vintage/cs-acs-front.png',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'uluru-ukulele' },
      update: {},
      create: {
        name: 'Uluru Ukulele',
        slug: 'uluru-ukulele',
        description: 'Ayers 旗下的 Uluru 烏克麗麗系列，延續品牌對音色品質的堅持，採用精選木材與手工製作。',
        image: '/images/products/uluru/manako-iii-front.png',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Ayers 原廠配件，為您的吉他提供最好的保護與配備。',
        image: '/images/products/accessories/blue-gig-bag.png',
      },
    }),
  ]);

  const [waveCat, lightCat, sunCat, masterCat, vintageCat, uluruCat, accessoriesCat] = categories;

  console.log('✅ Categories created:', categories.length);

  // ============================================================
  // 創建 Ayers 吉他商品（依官網完整產品線）
  // ============================================================
  const products = await Promise.all([

    // ══════════════════════════════════════
    // WAVE Series（濤系列）- 10 款
    // ══════════════════════════════════════
    prisma.product.create({
      data: {
        name: 'A05c Wave',
        description: 'A05c Wave 是 WAVE 系列中最受歡迎的型號之一。Auditorium 缺角琴身設計，搭配西堤卡雲杉面板與印度玫瑰木背側板，提供溫暖飽滿的音色與出色的投射力。缺角設計讓高把位演奏更加自如。',
        price: 31500,
        categoryId: waveCat.id,
        images: [
          '/images/products/wave/a05c-wave-front.png',
          '/images/products/wave/a05c-wave-back.png',
          '/images/products/wave/a05c-wave-detail.jpg',
          '/images/products/wave/a05c-wave-studio.jpg',
          '/images/products/wave/a05c-wave-angle.jpg',
        ],
        stock: 5,
        specifications: {
          model: 'A-05C',
          series: 'Wave',
          bodyShape: 'Auditorium Cutaway',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '非洲胡桃木 (African Walnut) #5',
          neck: '單一桃花心木 (One-piece Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光/消光可選（琴頸消光）',
          nutWidth: '43mm',
          tuners: 'Gotoh 301 金色',
          strings: "D'Addario EXP-16",
          binding: '玫瑰木（琴身＆琴頭）',
          rosette: '玫瑰木搭配綠鮑魚貝鑲嵌',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A06c Wave',
        description: 'A06c Wave 採用 Auditorium 缺角設計，搭配英格曼雲杉面板與印度玫瑰木背側板。音色清透明亮，高頻延伸極佳，是指彈演奏者的理想選擇。',
        price: 32800,
        categoryId: waveCat.id,
        images: [
          '/images/products/wave/a06c-wave-front.png',
        ],
        stock: 4,
        specifications: {
          model: 'A-06C',
          series: 'Wave',
          bodyShape: 'Auditorium Cutaway',
          top: '3A 英格曼雲杉 (Engelmann Spruce) 面單板',
          backSides: '德國楓木 (German Maple) #6',
          neck: '單一桃花心木 (One-piece Mahogany)',
          fingerboard: '烏木 (Ebony)',
          bridge: '烏木 (Ebony)',
          finish: '亮光/消光可選（琴頸消光）',
          nutWidth: '43mm',
          tuners: 'Gotoh 301 金色',
          strings: 'Elixir',
          binding: '玫瑰木或楓木（琴身）；楓木（琴頭）',
          rosette: '玫瑰木',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A07c-25th-Adi Wave',
        description: 'A07c-25th-Adi Wave 是 Ayers 25 週年紀念限定款。Auditorium 缺角琴身搭配頂級阿迪朗達克雲杉面板與印度玫瑰木背側板，音色明亮通透、動態範圍極廣。25 週年特別鑲嵌設計，極具收藏價值。',
        price: 72800,
        categoryId: waveCat.id,
        images: [
          '/images/products/wave/ay25-front.png',
          '/images/products/wave/ay25-detail.jpg',
          '/images/products/wave/ay25-studio1.jpg',
          '/images/products/wave/ay25-studio2.jpg',
        ],
        stock: 2,
        specifications: {
          model: 'A-07C-25th-Adi',
          series: 'Wave',
          bodyShape: 'Auditorium Cutaway',
          top: '阿迪朗達克雲杉 (Adirondack Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          special: '25週年限定紀念款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A Koa-special Wave',
        description: 'A Koa-special Wave 是 WAVE 系列的珍稀特別版。採用頂級夏威夷相思木（Koa）製作面板與背側板，音色溫暖甜美、泛音華麗，木紋獨特美麗。每把琴都是獨一無二的珍品。',
        price: 85000,
        categoryId: waveCat.id,
        images: [
          '/images/products/wave/a-koa-special-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'A Koa-special',
          series: 'Wave',
          bodyShape: 'Auditorium',
          top: '夏威夷相思木 (Hawaiian Koa)',
          backSides: '夏威夷相思木 (Hawaiian Koa)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          special: '珍稀 Koa 限定版',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'D08 Wave',
        description: 'D08 Wave 是經典的 Dreadnought 桶身設計，擁有渾厚的低頻與強勁的音量投射。適合彈唱與節奏伴奏，是民謠吉他愛好者的首選。',
        price: 42000,
        categoryId: waveCat.id,
        images: [
          '/images/products/wave/d08-wave-front-studio.jpg',
          '/images/products/wave/d08-wave-front.png',
          '/images/products/wave/d08-wave-detail.jpg',
          '/images/products/wave/d08-wave-headstock.jpg',
          '/images/products/wave/d08-wave-soundhole.jpg',
        ],
        stock: 4,
        specifications: {
          model: 'D-08',
          series: 'Wave',
          bodyShape: 'Dreadnought',
          top: '西堤卡雲杉 (Sitka Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          scaleLength: '25.5"',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'N07 Wave',
        description: 'N07 Wave 是 WAVE 系列的尼龍弦古典吉他。精選雲杉面板搭配印度玫瑰木背側板，展現古典吉他特有的柔和溫暖音色。寬指板設計適合古典指法演奏。',
        price: 42500,
        categoryId: waveCat.id,
        images: [
          '/images/products/wave/n07-wave-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'N-07',
          series: 'Wave',
          bodyShape: 'Classical',
          top: '西堤卡雲杉 (Sitka Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          strings: '尼龍弦 (Nylon)',
          nutWidth: '52mm',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'N17 Wave',
        description: 'N17 Wave 是 WAVE 系列的高階尼龍弦古典吉他。頂級紅杉面板搭配印度玫瑰木背側板，音色深沉溫潤、層次豐富。精緻的音孔裝飾展現高級製琴工藝。',
        price: 42500,
        categoryId: waveCat.id,
        images: [
          '/images/products/wave/n17-wave-front.png',
        ],
        stock: 2,
        specifications: {
          model: 'N-17',
          series: 'Wave',
          bodyShape: 'Classical',
          top: '紅杉 (Cedar)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          strings: '尼龍弦 (Nylon)',
          nutWidth: '52mm',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'OM07c Wave',
        description: 'OM07c Wave 採用 Orchestra Model 缺角設計，音色均衡細膩。中等琴身大小在低頻深度與高頻清晰度之間取得完美平衡，適合指彈演奏與錄音使用。',
        price: 34800,
        categoryId: waveCat.id,
        images: [
          '/images/products/wave/om07c-wave-front.png',
        ],
        stock: 4,
        specifications: {
          model: 'OM-07C',
          series: 'Wave',
          bodyShape: 'Orchestra Model Cutaway',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '印度玫瑰木 (Indian Rosewood) #7',
          neck: '單一桃花心木 (One-piece Mahogany)',
          fingerboard: '烏木 (Ebony)',
          bridge: '烏木 (Ebony)',
          finish: '亮光/消光可選（琴頸消光）',
          nutWidth: '43mm',
          tuners: 'Gotoh 301 金色',
          strings: 'Elixir',
          binding: '玫瑰木（琴身＆琴頭）',
          rosette: '印度玫瑰木搭配綠鮑魚貝',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'SJ02 Wave',
        description: 'SJ02 Wave 採用 Small Jumbo 琴身設計，兼具 Jumbo 的渾厚低頻與中小型琴身的舒適手感。雲杉面板搭配桃花心木背側板，音色溫暖有力，適合彈唱演出。',
        price: 28000,
        categoryId: waveCat.id,
        images: [
          '/images/products/wave/sj02-wave-front.png',
        ],
        stock: 5,
        specifications: {
          model: 'SJ-02',
          series: 'Wave',
          bodyShape: 'Small Jumbo',
          top: '西堤卡雲杉 (Sitka Spruce)',
          backSides: '桃花心木 (Mahogany)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'SJ09c Wave',
        description: 'SJ09c Wave 是 WAVE 系列的頂級 Small Jumbo 缺角款。頂級木材搭配精緻鑲嵌工藝，提供渾厚有力的音色與寬廣的動態範圍。適合舞台演出的專業級吉他。',
        price: 72000,
        categoryId: waveCat.id,
        images: [
          '/images/products/wave/sj09c-wave-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'SJ-09C',
          series: 'Wave',
          bodyShape: 'Small Jumbo Cutaway',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '5A 夏威夷相思木 (Hawaiian Koa) #9',
          neck: '單一桃花心木 (One-piece Mahogany)',
          fingerboard: '烏木 (Ebony)',
          bridge: '烏木 (Ebony)',
          finish: '亮光/消光可選（琴頸緞面）',
          nutWidth: '43mm',
          tuners: 'Gotoh 301 金色',
          strings: 'Elixir',
          binding: '玫瑰木（琴身）；楓木（琴頭）',
          rosette: '鮑魚貝裝飾',
          special: '頂級 Koa 旗艦款',
        },
      },
    }),

    // ══════════════════════════════════════
    // LIGHT Series（光系列）- 10 款
    // ══════════════════════════════════════
    prisma.product.create({
      data: {
        name: 'AS05 Light',
        description: 'AS05 Light 採用 Auditorium Small 桶身設計，是 LIGHT 系列的入門代表。西堤卡雲杉面板搭配 Ovangkol 合板背側板，消光漆處理讓面板能更自由地振動，提供超越價位的豐富音色表現。',
        price: 9800,
        categoryId: lightCat.id,
        images: [
          '/images/products/light/as05-light-front.png',
          '/images/products/light/as05-light-back.png',
        ],
        stock: 15,
        specifications: {
          model: 'AS-05',
          series: 'Light',
          bodyShape: 'Baden A Style',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '非洲胡桃木 (African Walnut) #5',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '雞翅木 (Wenge)',
          bridge: '雞翅木 (Wenge)',
          finish: '消光琴身 / 半光琴頸',
          nutWidth: '43mm',
          tuners: '銀色',
          strings: "D'Addario EXP-16",
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'L05 Light',
        description: 'L05 Light 採用 Parlor 小桶身設計與西堤卡雲杉面板，消光漆處理讓面板能更自由地振動。輕量化力木結構帶來靈敏的面板反應，讓輕觸弦也能獲得豐富的音色回饋。',
        price: 9800,
        categoryId: lightCat.id,
        images: [
          '/images/products/light/l05-light-front.png',
          '/images/products/light/l05-light-back.png',
          '/images/products/light/l05-light-detail.png',
          '/images/products/light/l05-light-studio1.png',
          '/images/products/light/l05-light-studio2.png',
        ],
        stock: 15,
        specifications: {
          model: 'L-05',
          series: 'Light',
          bodyShape: 'Parlor / Grand Concert',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '非洲胡桃木 (African Walnut) #5',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '雞翅木 (Wenge)',
          bridge: '雞翅木 (Wenge)',
          finish: '消光琴身 / 緞面琴頸',
          nutWidth: '43mm',
          tuners: '銀色',
          strings: "D'Addario EXP-16",
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'OM05 Light',
        description: 'OM05 Light 採用 Orchestra Model 桶身，比 L05 擁有更大的共鳴腔體。西堤卡雲杉面板搭配 Ovangkol 合板背側板，消光漆處理，在保持輕盈手感的同時提供更飽滿的音量。',
        price: 9800,
        categoryId: lightCat.id,
        images: [
          '/images/products/light/om05-light-front.png',
          '/images/products/light/om05-light-back.png',
          '/images/products/light/om05-light-detail.png',
          '/images/products/light/om05-light-studio1.png',
          '/images/products/light/om05-light-studio2.png',
        ],
        stock: 12,
        specifications: {
          model: 'OM-05',
          series: 'Light',
          bodyShape: 'Orchestra Model',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '非洲胡桃木 (African Walnut) #5',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '雞翅木 (Wenge)',
          bridge: '雞翅木 (Wenge)',
          finish: '消光琴身 / 緞面琴頸',
          nutWidth: '43mm',
          tuners: '銀色',
          strings: "D'Addario EXP-17",
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'N07 Light',
        description: 'N07 Light 是 LIGHT 系列的尼龍弦古典吉他。雲杉面板搭配 Ovangkol 背側板，寬指板設計適合古典指法。消光漆處理讓面板振動更自由，以親民價位體驗古典吉他的魅力。',
        price: 18500,
        categoryId: lightCat.id,
        images: [
          '/images/products/light/n07-light-front.png',
        ],
        stock: 8,
        specifications: {
          model: 'N-07 Light',
          series: 'Light',
          bodyShape: 'Classical',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '印度玫瑰木 (Indian Rosewood) #7',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光琴身 / 消光琴頸',
          strings: '尼龍弦 (Nylon)',
          nutWidth: '51mm',
          tuners: 'Gotoh Classical 35G1800ENS',
          binding: '印度玫瑰木或楓木',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'ST1M',
        description: 'ST1M 是 LIGHT 系列的旅行吉他，搭配桃花心木面板與背側板。緊湊的琴身設計方便攜帶，消光漆處理帶來自然的觸感。適合旅行練習與隨興彈奏。',
        price: 12500,
        categoryId: lightCat.id,
        images: [
          '/images/products/light/st1m-front.png',
        ],
        stock: 10,
        specifications: {
          model: 'ST1M',
          series: 'Light',
          bodyShape: 'Auditorium',
          top: '3A 非洲桃花心木 (African Mahogany) 面單板',
          backSides: '非洲桃花心木 (African Mahogany) #4',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光琴身 / 消光琴頸',
          nutWidth: '43mm',
          tuners: '銀色',
          strings: "D'Addario EXP-16",
          binding: '印度玫瑰木',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'ST1',
        description: 'ST1 是 LIGHT 系列的旅行吉他，雲杉面板版本。輕巧琴身設計讓練習隨時隨地，面單雲杉面板帶來明亮清晰的音色表現。',
        price: 13500,
        categoryId: lightCat.id,
        images: [
          '/images/products/light/st1-front.png',
        ],
        stock: 10,
        specifications: {
          model: 'ST1',
          series: 'Light',
          bodyShape: 'Auditorium',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '非洲桃花心木 (African Mahogany) #4',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光琴身 / 消光琴頸',
          nutWidth: '43mm',
          tuners: '銀色',
          strings: "D'Addario EXP-16",
          binding: '印度玫瑰木',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'ST2',
        description: 'ST2 是 LIGHT 系列的進階旅行吉他。Grand Auditorium 缺角琴身搭配雲杉面板與玫瑰木背側板，在小琴身中展現令人驚喜的音色深度與寬廣度。',
        price: 15500,
        categoryId: lightCat.id,
        images: [
          '/images/products/light/st2-front.png',
        ],
        stock: 8,
        specifications: {
          model: 'ST2',
          series: 'Light',
          bodyShape: 'Auditorium',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '印度玫瑰木 (Indian Rosewood) #7',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光琴身 / 緞面琴頸',
          nutWidth: '43mm',
          tuners: '銀色',
          strings: "D'Addario EXP-16",
          binding: '印度玫瑰木',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'ST2-C',
        description: 'ST2-C 是 ST2 的缺角版本，Grand Auditorium 缺角設計讓高把位演奏更加自如。雲杉面板搭配玫瑰木背側板，音色均衡飽滿。',
        price: 15500,
        categoryId: lightCat.id,
        images: [
          '/images/products/light/st2-c-front.png',
        ],
        stock: 8,
        specifications: {
          model: 'ST2-C',
          series: 'Light',
          bodyShape: 'Grand Auditorium Cutaway',
          top: '雲杉 (Spruce)',
          backSides: '玫瑰木 (Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'ST2-Sakura',
        description: 'ST2-Sakura 是 ST2 的櫻花限定配色版本。獨特的粉色漸層搭配櫻花意象，讓這把琴成為充滿春天氣息的藝術品。音色表現與 ST2 相同，外觀更加亮眼。',
        price: 15500,
        categoryId: lightCat.id,
        images: [
          '/images/products/light/st2-sakura-front.png',
        ],
        stock: 5,
        specifications: {
          model: 'ST2-Sakura',
          series: 'Light',
          bodyShape: 'Grand Auditorium Cutaway',
          top: '雲杉 (Spruce)',
          backSides: '桃花心木 (Mahogany)',
          finish: '特殊櫻花粉漸層色',
          special: '限定配色款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'ST2-Ocean',
        description: 'ST2-Ocean 是 Ayers 最具視覺衝擊力的型號。獨特的海洋漸層色彩（Teal to Amber）讓這把琴成為舞台上的焦點。缺角設計搭配優秀的音色表現，兼具美感與實用性。',
        price: 15500,
        categoryId: lightCat.id,
        images: [
          '/images/products/light/st2-ocean-1.png',
          '/images/products/light/st2-ocean-2.png',
          '/images/products/light/st2-ocean-3.png',
          '/images/products/light/st2-ocean-bridge.png',
          '/images/products/light/st2-ocean-cutaway.png',
          '/images/products/light/st2-ocean-headstock.png',
          '/images/products/light/st2-ocean-back-studio.png',
        ],
        stock: 3,
        specifications: {
          model: 'ST2-Ocean',
          series: 'Light',
          bodyShape: 'Grand Auditorium Cutaway',
          top: '雲杉 (Spruce)',
          backSides: '桃花心木 (Mahogany)',
          finish: '特殊海洋漸層色',
          special: '限定配色款',
        },
      },
    }),

    // ══════════════════════════════════════
    // SUN Series（日系列）- 14 款
    // ══════════════════════════════════════
    prisma.product.create({
      data: {
        name: 'OM01c Sun',
        description: 'OM01c Sun 採用 Orchestra Model 缺角設計，是 SUN 系列的入門級型號。雲杉面板搭配桃花心木背側板，音色均衡明亮，適合各種演奏風格。',
        price: 23500,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/om01c-sun-front.png',
        ],
        stock: 5,
        specifications: {
          model: 'OM-01C',
          series: 'Sun',
          bodyShape: 'Orchestra Model Cutaway',
          top: '西堤卡雲杉 (Sitka Spruce)',
          backSides: '桃花心木 (Mahogany)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A01c Sun',
        description: 'A01c Sun 採用 Auditorium 缺角琴身，是 SUN 系列的經典入門款。雲杉面板搭配桃花心木背側板，溫暖的音色與舒適的手感讓它成為初學進階者的最佳選擇。',
        price: 23500,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/a01c-sun-front.png',
        ],
        stock: 6,
        specifications: {
          model: 'A-01C',
          series: 'Sun',
          bodyShape: 'Auditorium Cutaway',
          top: '3A 英格曼雲杉 (Engelmann Spruce) 面單板',
          backSides: '沙比利 (Sapele) #1',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光琴身 / 消光琴頸',
          nutWidth: '44mm',
          tuners: '銀色',
          strings: "D'Addario EXP-16",
          binding: '印度玫瑰木',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A02c Sun',
        description: 'A02c Sun 在 A01c 基礎上升級了背側板木材，採用印度玫瑰木帶來更豐富的泛音與更深沉的低頻表現。Auditorium 缺角設計兼顧演奏舒適度。',
        price: 27500,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/a02c-sun-front.png',
        ],
        stock: 4,
        specifications: {
          model: 'A-02C',
          series: 'Sun',
          bodyShape: 'Auditorium Cutaway',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '越南桃花心木 (Vietnamese Mahogany) #2',
          neck: '單一桃花心木 (One-piece Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光琴身 / 消光琴頸',
          nutWidth: '44mm',
          tuners: '銀色',
          strings: "D'Addario EXP-16",
          rosette: '非洲桃花心木',
          special: '面板嵌入木雕太陽圖騰',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A02c mini Sun',
        description: 'A02c mini Sun 是 A02c 的迷你版本，較小的琴身讓女性與青少年演奏者也能輕鬆駕馭。保留了印度玫瑰木背側板的豐富音色，縮小琴身但不縮水音質。',
        price: 22500,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/a02c-mini-sun-front.png',
        ],
        stock: 5,
        specifications: {
          model: 'A-02C mini',
          series: 'Sun',
          bodyShape: 'Mini Auditorium Cutaway',
          top: '西堤卡雲杉 (Sitka Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          special: '迷你琴身',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A02c-20th Sun',
        description: 'A02c-20th Sun 是 Ayers 20 週年紀念版的 A02c。在經典配置基礎上加入特別的 20 週年鑲嵌設計與升級用料，展現品牌二十年的製琴精髓。',
        price: 48000,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/a02c-20th-sun-front.png',
        ],
        stock: 2,
        specifications: {
          model: 'A-02C-20th',
          series: 'Sun',
          bodyShape: 'Auditorium Cutaway（含斜角扶手）',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '非洲桃花心木 (African Mahogany) #4',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木（藤蔓主題木雕＆貝殼鑲嵌）',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光琴身 / 消光琴頸',
          nutWidth: '44mm',
          tuners: 'Gotoh 301 銀色',
          strings: 'Elixir',
          binding: '楓木（琴身邊緣＆音孔圈）',
          rosette: '印度玫瑰木楓葉鑲嵌',
          special: '20週年紀念限定版；紅花梨木扶手；鮑魚貝弦釘',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A03c mini Sun',
        description: 'A03c mini Sun 是 SUN 系列的迷你 Auditorium 缺角款。升級的木材配置搭配小巧琴身，讓演奏者在舒適的手感中享受高品質的音色表現。',
        price: 24500,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/a03c-mini-sun-front.png',
        ],
        stock: 5,
        specifications: {
          model: 'A-03C mini',
          series: 'Sun',
          bodyShape: 'Mini Auditorium Cutaway',
          top: '西堤卡雲杉 (Sitka Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          special: '迷你琴身',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A06-autumn Sun',
        description: 'A06-autumn Sun 以獨特的秋楓紅色調為特色，Auditorium 琴身搭配楓木面板，展現明亮清脆的音色特質。溫暖的紅棕色外觀讓這把琴在視覺與聽覺上都令人印象深刻。',
        price: 46000,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/a06-autumn-sun-front.png',
          '/images/products/sun/a06-autumn-sun-back.png',
          '/images/products/sun/a06-autumn-sun-detail.jpg',
        ],
        stock: 2,
        specifications: {
          model: 'A-06 Maple',
          series: 'Sun',
          bodyShape: 'Auditorium',
          top: '楓木 (Maple)',
          backSides: '楓木 (Maple)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '特殊秋楓紅染色亮光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A07c Sun',
        description: 'A07c Sun 是 SUN 系列的中高階 Auditorium 缺角款。精選雲杉面板搭配印度玫瑰木背側板，精緻的鑲嵌工藝與頂級音色表現，展現 Ayers 的製琴實力。',
        price: 44500,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/a07c-sun-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'A-07C',
          series: 'Sun',
          bodyShape: 'Auditorium Cutaway',
          top: '英格曼雲杉 (Engelmann Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A09c Sun',
        description: 'A09c Sun 採用 Auditorium 缺角設計，全桃花心木琴身帶來溫暖醇厚的中頻音色。獨特的木紋質感與精緻做工，讓每把琴都散發著溫潤的質感。',
        price: 32500,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/a09c-sun-front.png',
        ],
        stock: 4,
        specifications: {
          model: 'A-09C',
          series: 'Sun',
          bodyShape: 'Auditorium Cutaway',
          top: '桃花心木 (Mahogany)',
          backSides: '桃花心木 (Mahogany)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'A17c Sun',
        description: 'A17c Sun 是 SUN 系列的頂級旗艦型號。Auditorium 缺角琴身搭配頂級紅杉面板與印度玫瑰木背側板，琴頭上精緻的 Ayers 太陽花鑲嵌與音孔口的鮑魚貝裝飾，展現最高等級的製琴工藝。',
        price: 44500,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/a17c-sun-front.jpg',
          '/images/products/sun/a17c-sun-studio.jpg',
        ],
        stock: 1,
        specifications: {
          model: 'A-17C',
          series: 'Sun',
          bodyShape: 'Auditorium Cutaway',
          top: '紅杉 (Cedar)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          inlay: '太陽花鑲嵌、鮑魚貝音孔裝飾',
          special: '頂級旗艦款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'SJ22c Sun',
        description: 'SJ22c Sun 採用 Small Jumbo 缺角設計，渾厚的低頻與強勁的投射力讓它成為舞台表演的利器。雲杉面板搭配玫瑰木背側板，音色飽滿有力。',
        price: 36000,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/sj22c-sun-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'SJ-22C',
          series: 'Sun',
          bodyShape: 'Small Jumbo Cutaway',
          top: '3A 非洲桃花心木 (African Mahogany) 面單板',
          backSides: '非洲桃花心木 (African Mahogany) #4',
          neck: '單一桃花心木 (One-piece Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光/消光可選',
          nutWidth: '44mm',
          tuners: 'Gotoh 301 銀色',
          strings: "D'Addario EXP-16",
          binding: '非洲桃花心木',
          special: '面板木雕太陽圖騰；溫暖純淨的中頻音色',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'SJ07c-20th Sun',
        description: 'SJ07c-20th Sun（Passion Deluxe）是 Ayers 20 週年紀念旗艦。Super Jumbo 缺角琴身搭配頂級紅杉面板與印度玫瑰木背側板，音色深沉有力、泛音豐富。琴頭與音孔的精緻鑲嵌展現頂級工藝。',
        price: 62800,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/sj07c-passion-front.png',
          '/images/products/sun/sj07c-passion-back.png',
          '/images/products/sun/sj07c-passion-front-studio.jpg',
          '/images/products/sun/sj07c-passion-back-studio.jpg',
          '/images/products/sun/sj07c-passion-studio1.jpg',
          '/images/products/sun/sj07c-passion-studio2.jpg',
        ],
        stock: 2,
        specifications: {
          model: 'SJ-07C (SJCXW)',
          series: 'Sun',
          bodyShape: 'Super Jumbo Cutaway',
          top: '紅杉 (Cedar)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          special: '20週年 Passion Deluxe 限定',
          inlay: '精緻貝殼鑲嵌',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'OM22c-blackout Sun',
        description: 'OM22c-blackout Sun 是 SUN 系列的暗黑特別版。全黑配色搭配 Orchestra Model 缺角設計，散發低調而強烈的個性。雲杉面板搭配玫瑰木背側板，音色均衡細膩。',
        price: 36000,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/om22c-blackout-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'OM-22C Blackout',
          series: 'Sun',
          bodyShape: 'Orchestra Model Cutaway',
          top: '西堤卡雲杉 (Sitka Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '特殊全黑亮光漆',
          special: 'Blackout 暗黑限定版',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'OM22c-brown Sun',
        description: 'OM22c-brown Sun 是 SUN 系列的棕色特別版。溫暖的棕色 Sunburst 配色搭配 Orchestra Model 缺角設計，展現經典的復古美感。音色均衡細膩，適合各種演奏風格。',
        price: 36000,
        categoryId: sunCat.id,
        images: [
          '/images/products/sun/om22c-brown-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'OM-22C Brown',
          series: 'Sun',
          bodyShape: 'Orchestra Model Cutaway',
          top: '西堤卡雲杉 (Sitka Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '棕色 Sunburst 亮光漆',
          special: 'Brown Sunburst 限定版',
        },
      },
    }),

    // ══════════════════════════════════════
    // MASTER Series（大師系列）- 10 款
    // ══════════════════════════════════════
    prisma.product.create({
      data: {
        name: 'AX BR KOI',
        description: 'AX BR KOI 是 MASTER 系列的至尊之作。以錦鯉為主題的極致貝殼鑲嵌覆蓋整個琴體，結合頂級巴西玫瑰木背側板與阿迪朗達克雲杉面板，音色與藝術性都達到登峰造極的境界。',
        price: 320000,
        categoryId: masterCat.id,
        images: [
          '/images/products/master/ax-br-koi-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'AX BR KOI',
          series: 'Master',
          bodyShape: 'Auditorium Cutaway（含斜角扶手）',
          top: '5A 阿迪朗達克雲杉 (Adirondack Spruce) 面單板',
          backSides: '巴西玫瑰木 (Brazilian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          inlay: '極致錦鯉貝殼鑲嵌（全琴身）',
          special: '頂級藝術收藏款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wolf',
        description: 'Wolf 以狼為主題，精緻的貝殼鑲嵌描繪出月光下孤狼的意象。頂級木材搭配大師級工藝，每一個細節都展現出非凡的藝術造詣。',
        price: 250000,
        categoryId: masterCat.id,
        images: [
          '/images/products/master/wolf-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'Wolf',
          series: 'Master',
          bodyShape: 'Dreadnought Cutaway（含斜角扶手）',
          top: '5A 夏威夷相思木 (Hawaiian Koa) 面單板',
          backSides: '5A 夏威夷相思木 (Hawaiian Koa) #9',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木（狼群＆樹木珍珠母貝鑲嵌）',
          bridge: '烏木 (Ebony)',
          finish: '亮光琴身 / 緞面琴頸',
          nutWidth: '44mm',
          tuners: 'Gotoh 510 金色',
          strings: 'Elixir',
          binding: '烏木 & 鮑魚貝',
          rosette: '荒野狼群鮑魚貝設計',
          inlay: '指板狼嚎剪影；琴頭狼圖騰雕刻；全 Koa 構造',
          special: '大師藝術收藏款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'KOI',
        description: 'KOI 以經典的錦鯉圖騰為靈感，精美的鮑魚貝鑲嵌展現出水中錦鯉的優雅姿態。頂級音色與藝術之美的完美結合。',
        price: 190000,
        categoryId: masterCat.id,
        images: [
          '/images/products/master/koi-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'KOI',
          series: 'Master',
          bodyShape: 'Auditorium Cutaway（含斜角扶手）',
          top: '3A 阿爾卑斯雲杉 (Alpine Spruce) 面單板',
          backSides: '可可波洛 (Cocobolo)',
          neck: '單一桃花心木 (One-piece Mahogany)',
          fingerboard: '烏木（錦鯉珍珠母貝鑲嵌）',
          bridge: '烏木 (Ebony)',
          finish: '亮光琴身 / 消光琴頸',
          nutWidth: '44mm',
          tuners: 'Gotoh 510 金色',
          strings: 'Elixir',
          binding: '玫瑰木（琴身＆琴頭）',
          rosette: '錦鯉珍珠母貝雕刻搭配玫瑰木＆綠鮑魚貝鑲邊',
          inlay: '錦鯉珍珠母貝鑲嵌',
          special: '大師藝術收藏款；Cocobolo 頂級音色木',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'The Throne',
        description: 'The Throne 以王座為主題，氣勢磅礴的貝殼鑲嵌展現出帝王般的尊貴氣質。頂級木材與精湛工藝的結合，讓這把琴成為收藏家的夢想之作。',
        price: 190000,
        categoryId: masterCat.id,
        images: [
          '/images/products/master/throne-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'The Throne',
          series: 'Master',
          bodyShape: 'Auditorium',
          top: '阿迪朗達克雲杉 (Adirondack Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          inlay: '王座圖騰貝殼鑲嵌',
          special: '大師藝術收藏款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'ANGEL',
        description: 'ANGEL 以天使為主題，翅膀造型的貝殼鑲嵌優雅地展開於琴面之上。聖潔的意象搭配清澈透明的音色，是 MASTER 系列中最具詩意的作品。',
        price: 170000,
        categoryId: masterCat.id,
        images: [
          '/images/products/master/angel-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'ANGEL',
          series: 'Master',
          bodyShape: 'Auditorium',
          top: '阿迪朗達克雲杉 (Adirondack Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          inlay: '天使翅膀貝殼鑲嵌',
          special: '大師藝術收藏款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'TIGER',
        description: 'TIGER 以猛虎為主題，栩栩如生的老虎貝殼鑲嵌展現出力量與野性之美。頂級木材帶來渾厚有力的音色，完美呼應猛虎的氣勢。',
        price: 160000,
        categoryId: masterCat.id,
        images: [
          '/images/products/master/tiger-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'TIGER',
          series: 'Master',
          bodyShape: 'Small Jumbo Cutaway（含斜角扶手）',
          top: '3A 英格曼雲杉 (Engelmann Spruce) 面單板',
          backSides: '德國楓木 (German Maple) #6',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          bridge: '烏木 (Ebony)',
          finish: '亮光琴身 / 消光琴頸',
          nutWidth: '44mm',
          tuners: 'Gotoh 510 金色',
          strings: 'Elixir',
          binding: '越南玫瑰木、玫瑰木、綠鮑魚貝（琴身）',
          inlay: '虎爪琴頭設計；虎眼鮑魚貝鑲嵌；背板虎頭；音孔虎牙圖騰；指板鮑魚貝虎頭',
          special: '大師藝術收藏款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'L-oo8 Wild Cat',
        description: 'L-oo8 Wild Cat 以野貓為靈感，L-body 琴身搭配精美的貝殼鑲嵌。較小的琴身帶來靈敏的反應與清晰的音色，野貓圖騰更添幾分不羈的魅力。',
        price: 130000,
        categoryId: masterCat.id,
        images: [
          '/images/products/master/wild-cat-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'L-oo8 Wild Cat',
          series: 'Master',
          bodyShape: 'L-body (Grand Concert)',
          top: '阿迪朗達克雲杉 (Adirondack Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          inlay: '野貓圖騰貝殼鑲嵌',
          special: '大師藝術收藏款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Rebirth',
        description: 'Rebirth 以鳳凰涅槃為主題，象徵重生與希望的貝殼鑲嵌從琴體中心向外綻放。頂級音色與深遠的意涵讓這把琴成為靈魂之作。',
        price: 110000,
        categoryId: masterCat.id,
        images: [
          '/images/products/master/rebirth-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'Rebirth',
          series: 'Master',
          bodyShape: 'Auditorium',
          top: '阿迪朗達克雲杉 (Adirondack Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          inlay: '鳳凰涅槃貝殼鑲嵌',
          special: '大師藝術收藏款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'ROSE',
        description: 'ROSE 以玫瑰花為主題，精緻的貝殼鑲嵌描繪出盛開的玫瑰。浪漫的視覺意象搭配甜美溫暖的音色，是 MASTER 系列中最具浪漫氣質的作品。',
        price: 106000,
        categoryId: masterCat.id,
        images: [
          '/images/products/master/rose-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'ROSE',
          series: 'Master',
          bodyShape: 'Small Jumbo Cutaway（含斜角扶手）',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 面單板',
          backSides: '非洲桃花心木 (African Mahogany) #4',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木（玫瑰荊棘與花苞鑲嵌）',
          bridge: '烏木 (Ebony)',
          finish: '亮光琴身 / 消光琴頸',
          nutWidth: '44mm',
          tuners: 'Gotoh 510 金色',
          strings: 'Elixir',
          binding: '玫瑰木（琴身）；綠鮑魚貝（琴頭）',
          inlay: '玫瑰花鑲嵌（音孔圈＆指板）',
          special: '大師藝術收藏款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Music Dragon',
        description: 'Music Dragon 以龍為主題，東方神龍的貝殼鑲嵌氣勢非凡。融合東方美學與西方吉他工藝，音色渾厚有力、氣勢磅礴。',
        price: 96000,
        categoryId: masterCat.id,
        images: [
          '/images/products/master/music-dragon-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'Music Dragon',
          series: 'Master',
          bodyShape: 'Small Jumbo Cutaway（含斜角扶手）',
          top: '3A 英格曼雲杉 (Engelmann Spruce) 面單板',
          backSides: '德國楓木 (German Maple) #6',
          neck: '楓木 (Maple)',
          fingerboard: '烏木（音符鑲嵌）',
          bridge: '烏木 (Ebony)',
          finish: '亮光琴身 / 緞面琴頸',
          nutWidth: '44mm',
          tuners: 'Gotoh 301 金色',
          strings: 'Elixir',
          binding: '越南玫瑰木（琴身＆琴頭）；白楓木紋路裝飾',
          inlay: '中國龍圖騰面板木雕；音符鑲嵌音孔圈',
          special: '大師藝術收藏款',
        },
      },
    }),

    // ══════════════════════════════════════
    // Vintage Series（經典系列）- 12 款
    // ══════════════════════════════════════
    prisma.product.create({
      data: {
        name: 'CS (ACS)',
        description: 'CS (ACS) 是 Vintage 經典系列的 Auditorium 琴型，由澳洲製琴大師 Gerard Gilet 設計。採用自然風乾的頂級雲杉面板搭配印度玫瑰木背側板，以傳統工法打造經典的復古音色。',
        price: 26500,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/cs-acs-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'ACS',
          series: 'Vintage',
          bodyShape: 'Auditorium',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 自然風乾面單板',
          backSides: '非洲桃花心木 (African Mahogany) #4',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '消光琴身 / 消光琴頸',
          nutWidth: '43mm',
          tuners: '銀色',
          strings: "D'Addario EXP-16",
          binding: '印度玫瑰木',
          designer: 'Gerard Gilet',
          special: '限量經典系列',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'CS (DCS)',
        description: 'CS (DCS) 是 Vintage 經典系列的 Dreadnought 琴型。Gerard Gilet 設計，自然風乾雲杉面板搭配印度玫瑰木背側板，Dreadnought 桶身帶來渾厚的低頻與強勁的投射力。',
        price: 26500,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/cs-dcs-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'DCS',
          series: 'Vintage',
          bodyShape: 'Dreadnought',
          top: '雲杉 (Spruce) - 自然風乾',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          designer: 'Gerard Gilet',
          special: '限量經典系列',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'CSRL (DCSRL)',
        description: 'CSRL (DCSRL) 是 Vintage 經典系列的入門款 Dreadnought。Gerard Gilet 設計，以親民的價格體驗經典系列的復古音色魅力。',
        price: 20500,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/csrl-dcsrl-front.png',
        ],
        stock: 5,
        specifications: {
          model: 'DCSRL',
          series: 'Vintage',
          bodyShape: 'Dreadnought',
          top: '雲杉 (Spruce) - 自然風乾',
          backSides: '玫瑰木 (Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          designer: 'Gerard Gilet',
          special: '限量經典系列',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'DSRL',
        description: 'DSRL 是 Vintage 經典系列的入門 Dreadnought 款，Gerard Gilet 設計。以經濟實惠的價格提供經典系列的音色品質，適合初次接觸 Vintage 系列的演奏者。',
        price: 20500,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/dsrl-front.png',
        ],
        stock: 5,
        specifications: {
          model: 'DSRL',
          series: 'Vintage',
          bodyShape: 'Dreadnought',
          top: '雲杉 (Spruce) - 自然風乾',
          backSides: '玫瑰木 (Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          designer: 'Gerard Gilet',
          special: '限量經典系列',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'M (AM)',
        description: 'M (AM) 是 Vintage 經典系列的 Auditorium 桃花心木款。Gerard Gilet 設計，全桃花心木琴身帶來溫暖醇厚的音色，復古的外觀極具魅力。',
        price: 26500,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/m-am-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'AM',
          series: 'Vintage',
          bodyShape: 'Auditorium',
          top: '桃花心木 (Mahogany) - 自然風乾',
          backSides: '桃花心木 (Mahogany)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          designer: 'Gerard Gilet',
          special: '限量經典系列',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'M (DM)',
        description: 'M (DM) 是 Vintage 經典系列的 Dreadnought 桃花心木款。Gerard Gilet 設計，全桃花心木琴身的 Dreadnought 帶來溫暖而有力的音色表現。',
        price: 26500,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/m-dm-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'DM',
          series: 'Vintage',
          bodyShape: 'Dreadnought',
          top: '桃花心木 (Mahogany) - 自然風乾',
          backSides: '桃花心木 (Mahogany)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          designer: 'Gerard Gilet',
          special: '限量經典系列',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'MM (DMM)',
        description: 'MM (DMM) 是 Vintage 經典系列的進階 Dreadnought 桃花心木款。Gerard Gilet 設計，升級的用料與工藝帶來更精緻的音色表現與更高級的質感。',
        price: 33500,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/mm-dmm-front.png',
        ],
        stock: 2,
        specifications: {
          model: 'DMM',
          series: 'Vintage',
          bodyShape: 'Dreadnought',
          top: '桃花心木 (Mahogany) - 自然風乾',
          backSides: '桃花心木 (Mahogany)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          designer: 'Gerard Gilet',
          special: '限量經典系列（進階款）',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'S (DS)',
        description: 'S (DS) 是 Vintage 經典系列的 Dreadnought 雲杉/玫瑰木款。Gerard Gilet 設計，經典的雲杉＋玫瑰木組合帶來明亮通透的音色與豐富的泛音。',
        price: 26500,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/s-ds-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'DS',
          series: 'Vintage',
          bodyShape: 'Dreadnought',
          top: '雲杉 (Spruce) - 自然風乾',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          designer: 'Gerard Gilet',
          special: '限量經典系列',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'SM (ASM)',
        description: 'SM (ASM) 是 Vintage 經典系列的進階 Auditorium 款。Gerard Gilet 設計，頂級自然風乾雲杉面板搭配精選印度玫瑰木背側板，音色成熟飽滿、層次豐富。',
        price: 33500,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/sm-asm-front.png',
        ],
        stock: 2,
        specifications: {
          model: 'ASM',
          series: 'Vintage',
          bodyShape: 'Auditorium',
          top: '雲杉 (Spruce) - 自然風乾（頂級）',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          designer: 'Gerard Gilet',
          special: '限量經典系列（進階款）',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'SM (DSM)',
        description: 'SM (DSM) 是 Vintage 經典系列的進階 Dreadnought 款。Gerard Gilet 設計，頂級自然風乾雲杉面板搭配精選印度玫瑰木背側板，渾厚有力的 Dreadnought 音色。',
        price: 33500,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/sm-dsm-front.png',
        ],
        stock: 2,
        specifications: {
          model: 'DSM',
          series: 'Vintage',
          bodyShape: 'Dreadnought',
          top: '雲杉 (Spruce) - 自然風乾（頂級）',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          designer: 'Gerard Gilet',
          special: '限量經典系列（進階款）',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'SOL (DSOL)',
        description: 'SOL (DSOL) 是 Vintage 經典系列的入門款。Gerard Gilet 設計，以最親民的價格讓更多人能體驗 Vintage 系列獨特的復古音色魅力。',
        price: 18000,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/sol-dsol-front.png',
        ],
        stock: 6,
        specifications: {
          model: 'DSOL',
          series: 'Vintage',
          bodyShape: 'Dreadnought',
          top: '雲杉 (Spruce) - 自然風乾',
          backSides: '玫瑰木 (Rosewood)',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '消光漆',
          designer: 'Gerard Gilet',
          special: '限量經典系列（入門款）',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'SR (DSR)',
        description: 'SR (DSR) 是 Vintage 經典系列的頂級旗艦。Gerard Gilet 設計，採用最頂級的自然風乾木材與最精緻的工藝，展現 Vintage 系列的最高音色成就。',
        price: 42000,
        categoryId: vintageCat.id,
        images: [
          '/images/products/vintage/sr-dsr-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'DSR',
          series: 'Vintage',
          bodyShape: 'Dreadnought',
          top: '3A 西堤卡雲杉 (Sitka Spruce) 頂級自然風乾面單板',
          backSides: '印度玫瑰木 (Indian Rosewood) #7',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          bridge: '烏木 (Ebony)',
          finish: '亮光琴身 / 緞面琴頸',
          nutWidth: '43mm',
          tuners: '金/黑色',
          strings: "D'Addario EXP-16",
          binding: '楓木搭配綠鮑魚貝鑲嵌（面板＆音孔圈）',
          designer: 'Gerard Gilet',
          special: '限量經典系列（頂級旗艦）；溫暖厚實中頻搭配豐富泛音',
        },
      },
    }),

    // ══════════════════════════════════════
    // Uluru Ukulele（烏克麗麗系列）- 15 款
    // ══════════════════════════════════════
    prisma.product.create({
      data: {
        name: 'ULURU II',
        description: 'ULURU II 是 Uluru 系列的入門款烏克麗麗。桃花心木面板與背側板帶來溫暖圓潤的傳統烏克麗麗音色，精緻的手工製作品質讓初學者也能享受高品質的演奏體驗。',
        price: 8500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/uluru-ii-front.png',
        ],
        stock: 10,
        specifications: {
          model: 'ULURU II',
          series: 'Uluru',
          size: 'Soprano (21") / Tenor (26")',
          top: '3A 非洲桃花心木 (African Mahogany) 面單板',
          backSides: '非洲桃花心木 (African Mahogany) 面單板',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光/消光可選',
          nutWidth: '37mm',
          tuners: '銀色木旋鈕摩擦式弦鈕',
          strings: '尼龍弦',
          special: '雷射雕刻 ULURU 標誌',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'ULURU IIIC',
        description: 'ULURU IIIC 是 ULURU II 的 Concert 缺角版本。較大的 Concert 琴身提供更飽滿的音量，缺角設計讓高把位演奏更自如。',
        price: 10500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/uluru-iiic-front.png',
        ],
        stock: 8,
        specifications: {
          model: 'ULURU IIIC',
          series: 'Uluru',
          size: 'Concert Cutaway',
          top: '桃花心木 (Mahogany)',
          backSides: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '消光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'MANAKO II C',
        description: 'MANAKO II C 是 Manako 子系列的 Concert 缺角款。雲杉面板搭配桃花心木背側板，音色更明亮通透。缺角設計兼顧演奏便利性。',
        price: 13500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/manako-iic-front.png',
        ],
        stock: 8,
        specifications: {
          model: 'MANAKO II C',
          series: 'Uluru',
          size: 'Concert Cutaway',
          top: '雲杉 (Spruce)',
          backSides: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '消光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Manako III',
        description: 'Manako III 是 Uluru 系列的中階烏克麗麗。雲杉面板搭配桃花心木背側板，手工製作的精緻做工延續了 Ayers 對音色品質的堅持，提供溫暖甜美的烏克麗麗音色。',
        price: 14000,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/manako-iii-front.png',
          '/images/products/uluru/manako-iii-back.png',
          '/images/products/uluru/manako-iii-detail.png',
          '/images/products/uluru/manako-iii-studio1.png',
          '/images/products/uluru/manako-iii-studio2.png',
        ],
        stock: 10,
        specifications: {
          model: 'Manako III',
          series: 'Uluru',
          size: 'Concert',
          top: '雲杉 (Spruce)',
          backSides: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '消光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'MANAKO II-SP',
        description: 'MANAKO II-SP 是 Manako 子系列的特別版。升級的木材與精緻的裝飾讓這把烏克麗麗在音色與外觀上都更加出色。',
        price: 16500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/manako-ii-sp-front.png',
        ],
        stock: 5,
        specifications: {
          model: 'MANAKO II-SP',
          series: 'Uluru',
          size: 'Concert',
          top: '雲杉 (Spruce)',
          backSides: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          special: '特別版',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'MANAKO IIC-SP',
        description: 'MANAKO IIC-SP 是 Manako 特別版的缺角款。缺角設計讓高把位演奏更加自如，特別版的升級用料帶來更精緻的音色表現。',
        price: 17500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/manako-iic-sp-front.png',
        ],
        stock: 5,
        specifications: {
          model: 'MANAKO IIC-SP',
          series: 'Uluru',
          size: 'Concert Cutaway',
          top: '雲杉 (Spruce)',
          backSides: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          special: '特別版（缺角）',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'KOA III',
        description: 'KOA III 採用夏威夷相思木（Koa）製作，展現 Koa 木特有的溫暖甜美音色與華麗的木紋。是烏克麗麗愛好者夢寐以求的經典木材選擇。',
        price: 17000,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/koa-iii-front.png',
        ],
        stock: 4,
        specifications: {
          model: 'KOA III',
          series: 'Uluru',
          size: 'Soprano (21") / Concert (23")',
          top: '夏威夷相思木 (Hawaiian Koa) 面單板',
          backSides: '夏威夷相思木 (Hawaiian Koa) 面單板',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '消光琴身 / 緞面琴頸',
          nutWidth: '35mm',
          tuners: '銀色木旋鈕摩擦式弦鈕',
          strings: '尼龍弦',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'KOA II-P',
        description: 'KOA II-P（KOA II）採用夏威夷相思木面板與背側板，內建拾音器系統。溫暖甜美的 Koa 音色搭配擴音功能，適合舞台演出使用。',
        price: 17500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/koa-ii-p-front.png',
        ],
        stock: 4,
        specifications: {
          model: 'KOA II-P',
          series: 'Uluru',
          size: 'Concert',
          top: '夏威夷相思木 (Hawaiian Koa)',
          backSides: '夏威夷相思木 (Hawaiian Koa)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          pickup: '內建拾音系統',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'KOA IIC-P',
        description: 'KOA IIC-P 是 KOA 系列的缺角拾音器版本。夏威夷相思木琴身搭配缺角設計與內建拾音器，是專業舞台演出的烏克麗麗首選。',
        price: 18500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/koa-iic-p-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'KOA IIC-P',
          series: 'Uluru',
          size: 'Concert Cutaway',
          top: '夏威夷相思木 (Hawaiian Koa)',
          backSides: '夏威夷相思木 (Hawaiian Koa)',
          fingerboard: '玫瑰木 (Rosewood)',
          finish: '亮光漆',
          pickup: '內建拾音系統',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'NEHE II',
        description: 'NEHE II 是 Uluru 系列的進階款，採用精選木材與更精緻的做工。音色溫暖圓潤、共鳴豐富，適合對音色有更高要求的演奏者。',
        price: 18500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/nehe-ii-front.png',
        ],
        stock: 4,
        specifications: {
          model: 'NEHE II',
          series: 'Uluru',
          size: 'Concert',
          top: '雲杉 (Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'PUKANALA II',
        description: 'PUKANALA II 是 Uluru 系列的高階款。精選頂級木材搭配精緻的鑲嵌裝飾，音色清澈明亮、泛音豐富，展現手工烏克麗麗的極致品質。',
        price: 21500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/pukanala-ii-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'PUKANALA II',
          series: 'Uluru',
          size: 'Soprano (21") / Tenor (26")',
          top: '3A 夏威夷相思木 (Hawaiian Koa) 面單板',
          backSides: '3A 夏威夷相思木 (Hawaiian Koa) 面單板',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '玫瑰木 (Rosewood)',
          bridge: '玫瑰木 (Rosewood)',
          finish: '亮光琴身＆琴頸',
          nutWidth: '37mm',
          tuners: '金色 Koa 木旋鈕',
          strings: '尼龍弦',
          binding: '楓木（琴身）',
          rosette: '綠鮑魚貝',
          special: '琴頭太陽圖騰',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'PUKANALA IIC',
        description: 'PUKANALA IIC 是 PUKANALA II 的缺角版本。高階木材配置搭配缺角設計，讓演奏者能自由探索烏克麗麗的高把位音域。',
        price: 22500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/pukanala-iic-front.png',
        ],
        stock: 3,
        specifications: {
          model: 'PUKANALA IIC',
          series: 'Uluru',
          size: 'Concert Cutaway',
          top: '雲杉 (Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'KOHOLA I',
        description: 'KOHOLA I 是 Uluru 系列的精選款烏克麗麗。採用頂級木材與精緻的琴頭雕刻，展現出色的音色表現與工藝美學。',
        price: 22500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/kohola-i-front.png',
          '/images/products/uluru/kohola-i-back.png',
          '/images/products/uluru/kohola-i-detail.png',
          '/images/products/uluru/kohola-i-studio1.png',
          '/images/products/uluru/kohola-i-studio2.png',
        ],
        stock: 3,
        specifications: {
          model: 'KOHOLA I',
          series: 'Uluru',
          size: 'Concert',
          top: '雲杉 (Spruce)',
          backSides: '印度玫瑰木 (Indian Rosewood)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'LEHUA IIC',
        description: 'LEHUA IIC 是 Uluru 系列的頂級缺角款。以夏威夷 Lehua 花為名，採用最頂級的木材與精湛的鑲嵌工藝，音色極致純美、共鳴深沉。',
        price: 43500,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/lehua-iic-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'LEHUA IIC',
          series: 'Uluru',
          size: 'Concert Cutaway',
          top: '夏威夷相思木 (Hawaiian Koa)',
          backSides: '夏威夷相思木 (Hawaiian Koa)',
          fingerboard: '烏木 (Ebony)',
          finish: '亮光漆',
          inlay: '精緻貝殼鑲嵌',
          special: '頂級旗艦款',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'LEHUA III',
        description: 'LEHUA III 是 Uluru 系列的至尊旗艦。頂級夏威夷相思木琴身搭配大師級鑲嵌工藝，每一把都是獨一無二的藝術品，音色與美感兼備的極致之作。',
        price: 45000,
        categoryId: uluruCat.id,
        images: [
          '/images/products/uluru/lehua-iii-front.png',
        ],
        stock: 1,
        specifications: {
          model: 'LEHUA III',
          series: 'Uluru',
          size: 'Soprano (21") / Concert (23")',
          top: '3A 夏威夷相思木 (Hawaiian Koa) 面單板',
          backSides: '3A 夏威夷相思木 (Hawaiian Koa) 面單板',
          neck: '桃花心木 (Mahogany)',
          fingerboard: '烏木 (Ebony)',
          bridge: '烏木 (Ebony)',
          finish: '亮光琴身＆琴頸',
          nutWidth: '35mm',
          tuners: '金色 Koa 木旋鈕',
          strings: '尼龍弦',
          binding: '玫瑰木（琴身）；綠鮑魚貝（音孔）',
          inlay: '美人魚貝殼鑲嵌（琴頭）',
          special: '至尊旗艦款；可加購實木琴架 ($1,600)',
        },
      },
    }),

    // ══════════════════════════════════════
    // Accessories（配件）- 2 款
    // ══════════════════════════════════════
    prisma.product.create({
      data: {
        name: 'Ayers 豪華琴袋（藍灰色）',
        description: 'Ayers 原廠豪華琴袋，採用高品質防潑水面料與 25mm 厚海綿內襯，為您的吉他提供全方位保護。雙肩背帶設計、多個收納口袋，方便攜帶各種配件。',
        price: 3200,
        categoryId: accessoriesCat.id,
        images: [
          '/images/products/accessories/blue-gig-bag.png',
        ],
        stock: 20,
        specifications: {
          type: '琴袋',
          material: '防潑水尼龍',
          padding: '25mm 高密度海綿',
          color: '藍灰色',
          features: '雙肩背帶、多口袋設計',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ayers 標準琴袋（黑色）',
        description: 'Ayers 原廠標準琴袋，輕便實用的日常攜帶方案。防潑水面料搭配適度的海綿保護，雙肩背帶設計讓攜帶更加輕鬆。',
        price: 2500,
        categoryId: accessoriesCat.id,
        images: [
          '/images/products/accessories/black-gig-bag.png',
        ],
        stock: 25,
        specifications: {
          type: '琴袋',
          material: '防潑水尼龍',
          padding: '15mm 海綿',
          color: '黑色',
          features: '雙肩背帶',
        },
      },
    }),
  ]);

  console.log('✅ Products created:', products.length);

  // 創建一些商品評論
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        productId: products[0].id, // A05c Wave
        userId: user.id,
        rating: 5,
        comment: 'A05c Wave 的音色真的太棒了！溫暖飽滿的聲音讓人愛不釋手，缺角設計也讓高把位演奏非常方便。推薦給喜歡指彈的朋友！',
      },
    }),
    prisma.review.create({
      data: {
        productId: products[11].id, // L05 Light
        userId: user.id,
        rating: 5,
        comment: 'CP值超高的入門琴！雖然是 Light 系列，但音色表現完全超越這個價位應有的水準。消光漆的手感也很舒服。',
      },
    }),
    prisma.review.create({
      data: {
        productId: products[31].id, // SJ07c-20th Sun
        userId: user.id,
        rating: 5,
        comment: '夢想中的吉他！SJ07c 的低頻深度和泛音表現簡直無可挑剔，做工也是頂級水準。20週年紀念款值得收藏。',
      },
    }),
  ]);

  console.log('✅ Reviews created:', reviews.length);

  // Seed Home Banners
  const banners = [
    { slug: 'brand', subtitle: 'home.heroSubtitle', titleWord1: 'Ayers', titleWord2: 'Guitars', titleColor1: 'text-ayers-warm-cream', titleColor2: 'text-ayers-gold', body: 'home.heroBody', ctaLabel: 'home.heroCTA', ctaLink: '/collections', image: '/images/products/wave/a05c-wave-front.png', displayOrder: 0 },
    { slug: 'wave', subtitle: 'home.waveSeriesLabel', titleWord1: 'Wave', titleWord2: 'Series', titleColor1: 'text-ayers-gold', titleColor2: 'text-ayers-warm-cream', body: 'home.waveDesc', ctaLabel: 'home.viewSeries', ctaLink: '/collections?series=wave', image: '/images/products/wave/a05c-wave-front.png', displayOrder: 1 },
    { slug: 'sun', subtitle: 'home.sunSeriesLabel', titleWord1: 'Sun', titleWord2: 'Series', titleColor1: 'text-ayers-gold', titleColor2: 'text-ayers-warm-cream', body: 'home.sunDesc', ctaLabel: 'home.viewSeries', ctaLink: '/collections?series=sun', image: '/images/products/sun/sj07c-passion-front.png', displayOrder: 2 },
    { slug: 'light', subtitle: 'home.lightSeriesLabel', titleWord1: 'Light', titleWord2: 'Series', titleColor1: 'text-ayers-gold', titleColor2: 'text-ayers-warm-cream', body: 'home.lightDesc', ctaLabel: 'home.viewSeries', ctaLink: '/collections?series=light', image: '/images/products/light/st2-ocean-1.png', displayOrder: 3 },
    { slug: 'master', subtitle: 'home.masterSeriesLabel', titleWord1: 'Master', titleWord2: 'Series', titleColor1: 'text-ayers-gold', titleColor2: 'text-ayers-warm-cream', body: 'home.masterDesc', ctaLabel: 'home.viewSeries', ctaLink: '/collections?series=master', image: '/images/products/master/koi-front.png', displayOrder: 4 },
    { slug: 'vintage', subtitle: 'home.vintageSeriesLabel', titleWord1: 'Vintage', titleWord2: 'Series', titleColor1: 'text-ayers-gold', titleColor2: 'text-ayers-warm-cream', body: 'home.vintageDesc', ctaLabel: 'home.viewSeries', ctaLink: '/collections?series=vintage', image: '/images/products/vintage/sr-dsr-front.png', displayOrder: 5 },
    { slug: 'custom', subtitle: 'home.customizerLabel', titleWord1: 'Custom', titleWord2: 'Workshop', titleColor1: 'text-ayers-warm-cream', titleColor2: 'text-ayers-gold', body: 'home.customizerBody', ctaLabel: 'home.customizerCTA', ctaLink: '/customizer', image: '/images/products/light/st2-ocean-1.png', displayOrder: 6 },
  ];

  for (const b of banners) {
    await prisma.homeBanner.upsert({ where: { slug: b.slug }, update: b, create: b });
  }
  console.log('✅ Seeded home banners');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Admin user: ${admin.email} (password: Admin123!)`);
  console.log(`- Test user: ${user.email} (password: User123!)`);
  console.log(`- Categories: ${categories.length} (Wave, Light, Sun, Master, Vintage, Uluru, Accessories)`);
  console.log(`- Products: ${products.length}`);
  console.log(`- Reviews: ${reviews.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
