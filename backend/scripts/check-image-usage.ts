import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImageUsage() {
  const imagePath = '/uploads/products/aaf6dae2-0883-462c-8baa-0cfd886b0274.png';
  const imageFileName = 'aaf6dae2-0883-462c-8baa-0cfd886b0274.png';
  
  console.log('🔍 检查图片使用情况...');
  console.log(`📸 图片路径: ${imagePath}`);
  console.log(`📸 文件名: ${imageFileName}\n`);

  // 查找所有产品
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: true,
    },
  });

  console.log(`📦 总共有 ${products.length} 个产品\n`);

  // 检查哪些产品使用了这个图片
  const productsUsingImage = products.filter(product => 
    product.images.some(img => 
      img.includes(imageFileName) || img.includes('aaf6dae2-0883-462c-8baa-0cfd886b0274')
    )
  );

  if (productsUsingImage.length > 0) {
    console.log('✅ 找到使用此图片的产品:');
    productsUsingImage.forEach(product => {
      console.log(`  - ${product.name} (ID: ${product.id})`);
      console.log(`    图片: ${product.images.join(', ')}\n`);
    });
  } else {
    console.log('❌ 没有产品使用此图片');
    console.log('💡 这个图片可能是：');
    console.log('   1. 测试数据或旧数据');
    console.log('   2. 已删除产品的残留文件');
    console.log('   3. 上传失败或未使用的文件\n');
  }

  // 列出所有产品及其图片
  console.log('📋 所有产品的图片列表:');
  products.forEach(product => {
    if (product.images.length > 0) {
      console.log(`\n${product.name}:`);
      product.images.forEach(img => {
        console.log(`  - ${img}`);
      });
    }
  });

  await prisma.$disconnect();
}

checkImageUsage().catch(console.error);

