import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 創建管理員用戶
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
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
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'USER',
    },
  });

  console.log('✅ Test user created:', user.email);

  // 創建商品分類
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-garden' },
      update: {},
      create: {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home improvement and garden supplies',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'books' },
      update: {},
      create: {
        name: 'Books',
        slug: 'books',
        description: 'Books and educational materials',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
      },
    }),
  ]);

  console.log('✅ Categories created:', categories.length);

  // 創建範例商品
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system and A17 Pro chip. Features titanium design, Pro camera system with 5x Telephoto, and Action Button.',
        price: 999.99,
        categoryId: categories[0].id,
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        ],
        stock: 50,
        specifications: {
          storage: '256GB',
          color: 'Natural Titanium',
          screen: '6.1 inch Super Retina XDR',
          chip: 'A17 Pro',
          camera: 'Pro camera system with 5x Telephoto',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Air M2',
        description: 'Ultra-thin laptop with M2 chip for incredible performance. Features 13.6-inch Liquid Retina display, all-day battery life, and silent operation.',
        price: 1199.99,
        categoryId: categories[0].id,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
        ],
        stock: 30,
        specifications: {
          chip: 'Apple M2',
          memory: '8GB',
          storage: '256GB SSD',
          display: '13.6 inch Liquid Retina',
          battery: 'Up to 18 hours',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Premium Cotton T-Shirt',
        description: 'Soft, comfortable cotton t-shirt perfect for everyday wear. Available in multiple colors and sizes.',
        price: 29.99,
        categoryId: categories[1].id,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',
        ],
        stock: 100,
        specifications: {
          material: '100% Cotton',
          sizes: 'S, M, L, XL, XXL',
          colors: 'Black, White, Navy, Gray',
          care: 'Machine washable',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 199.99,
        categoryId: categories[0].id,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
        ],
        stock: 75,
        specifications: {
          battery: '30 hours',
          connectivity: 'Bluetooth 5.0',
          features: 'Noise Cancellation, Quick Charge',
          weight: '250g',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smart Home Speaker',
        description: 'Voice-controlled smart speaker with built-in virtual assistant and high-quality audio.',
        price: 149.99,
        categoryId: categories[0].id,
        images: [
          'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800',
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
        ],
        stock: 40,
        specifications: {
          voice: 'Built-in Assistant',
          audio: '360-degree sound',
          connectivity: 'Wi-Fi, Bluetooth',
          colors: 'Black, White',
        },
      },
    }),
  ]);

  console.log('✅ Products created:', products.length);

  // 創建一些商品評論
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        productId: products[0].id,
        userId: user.id,
        rating: 5,
        comment: 'Amazing phone! The camera quality is outstanding and the titanium build feels premium.',
      },
    }),
    prisma.review.create({
      data: {
        productId: products[1].id,
        userId: user.id,
        rating: 4,
        comment: 'Great laptop for work and entertainment. Battery life is impressive.',
      },
    }),
    prisma.review.create({
      data: {
        productId: products[2].id,
        userId: user.id,
        rating: 5,
        comment: 'Very comfortable and soft. Perfect fit and great quality.',
      },
    }),
  ]);

  console.log('✅ Reviews created:', reviews.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Admin user: ${admin.email} (password: Admin123!)`);
  console.log(`- Test user: ${user.email} (password: User123!)`);
  console.log(`- Categories: ${categories.length}`);
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


