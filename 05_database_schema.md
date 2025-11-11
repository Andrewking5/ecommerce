# 05 - 資料庫架構設計

## 資料庫選擇

### PostgreSQL (Supabase)
- **選擇理由**：強大的關聯式資料庫，支援複雜查詢和事務
- **優勢**：
  - ACID 事務保證
  - 豐富的資料型別支援
  - 優秀的全文搜尋功能
  - 強大的索引和查詢優化
  - Supabase 提供即時功能和 API 自動生成

### Redis (快取)
- **用途**：Session 儲存、快取、Rate Limiting
- **優勢**：高效能記憶體資料庫，支援複雜資料結構

## ERD 設計

### 實體關係圖
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │ Categories  │    │  Products   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ email       │    │ name        │    │ name        │
│ password    │    │ slug        │    │ description │
│ firstName   │    │ description │    │ price       │
│ lastName    │    │ image       │    │ categoryId  │
│ phone       │    │ isActive    │    │ images      │
│ role        │    │ createdAt   │    │ stock       │
│ isActive    │    │ updatedAt   │    │ isActive    │
│ createdAt   │    └─────────────┘    │ createdAt   │
│ updatedAt   │                        │ updatedAt   │
└─────────────┘                        └─────────────┘
       │                                       │
       │ 1:N                                   │ 1:N
       │                                       │
┌─────────────┐                        ┌─────────────┐
│   Orders    │                        │   Reviews   │
├─────────────┤                        ├─────────────┤
│ id (PK)     │                        │ id (PK)     │
│ userId (FK) │                        │ productId   │
│ status      │                        │ userId (FK) │
│ totalAmount │                        │ rating      │
│ shippingAddr│                        │ comment     │
│ billingAddr │                        │ createdAt   │
│ paymentMethod│                       │ updatedAt   │
│ createdAt   │                        └─────────────┘
│ updatedAt   │
└─────────────┘
       │
       │ 1:N
       │
┌─────────────┐
│ OrderItems  │
├─────────────┤
│ id (PK)     │
│ orderId (FK)│
│ productId   │
│ quantity    │
│ price       │
└─────────────┘
```

## Prisma Schema 定義

### 完整 Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用戶模型
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  phone     String?
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 關聯
  orders   Order[]
  reviews  Review[]
  cartItems CartItem[]

  @@map("users")
}

// 商品分類模型
model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  image       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 關聯
  products Product[]

  @@map("categories")
}

// 商品模型
model Product {
  id           String   @id @default(cuid())
  name         String
  description  String
  price        Decimal  @db.Decimal(10, 2)
  categoryId   String
  images       String[]
  stock        Int      @default(0)
  specifications Json?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // 關聯
  category   Category    @relation(fields: [categoryId], references: [id])
  orderItems OrderItem[]
  reviews    Review[]
  cartItems  CartItem[]

  @@map("products")
}

// 訂單模型
model Order {
  id            String      @id @default(cuid())
  userId        String
  status        OrderStatus @default(PENDING)
  totalAmount   Decimal     @db.Decimal(10, 2)
  shippingAddress Json
  billingAddress  Json?
  paymentMethod String
  paymentIntentId String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // 關聯
  user      User        @relation(fields: [userId], references: [id])
  orderItems OrderItem[]

  @@map("orders")
}

// 訂單項目模型
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Decimal @db.Decimal(10, 2)

  // 關聯
  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}

// 商品評論模型
model Review {
  id        String   @id @default(cuid())
  productId String
  userId    String
  rating    Int      @db.SmallInt
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 關聯
  product Product @relation(fields: [productId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@unique([productId, userId])
  @@map("reviews")
}

// 購物車項目模型
model CartItem {
  id        String @id @default(cuid())
  userId    String
  productId String
  quantity  Int    @default(1)

  // 關聯
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@unique([userId, productId])
  @@map("cart_items")
}

// 枚舉定義
enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

## Table Schema 詳細定義

### Users 表
```sql
CREATE TABLE users (
  id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(10) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

### Categories 表
```sql
CREATE TABLE categories (
  id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
```

### Products 表
```sql
CREATE TABLE products (
  id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  category_id VARCHAR(25) NOT NULL REFERENCES categories(id),
  images TEXT[] NOT NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  specifications JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_description ON products USING gin(to_tsvector('english', description));
```

### Orders 表
```sql
CREATE TABLE orders (
  id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(25) NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 
    'DELIVERED', 'CANCELLED', 'REFUNDED'
  )),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_method VARCHAR(50) NOT NULL,
  payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_payment ON orders(payment_intent_id);
```

### Order_Items 表
```sql
CREATE TABLE order_items (
  id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(25) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(25) NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### Reviews 表
```sql
CREATE TABLE reviews (
  id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(25) NOT NULL REFERENCES products(id),
  user_id VARCHAR(25) NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, user_id)
);

-- 索引
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

### Cart_Items 表
```sql
CREATE TABLE cart_items (
  id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(25) NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- 索引
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
```

## Migration 流程

### Prisma Migration
```bash
# 初始化 Prisma
npx prisma init

# 創建 Migration
npx prisma migrate dev --name init

# 應用 Migration 到生產環境
npx prisma migrate deploy

# 重置資料庫
npx prisma migrate reset

# 生成 Prisma Client
npx prisma generate
```

### Migration 範例
```sql
-- Migration: 20231201000000_init.sql
-- 創建用戶表
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- 創建唯一索引
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- 創建枚舉類型
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
```

### 資料庫種子 (Seed)
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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

  // 創建商品分類
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        image: 'https://example.com/electronics.jpg',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        image: 'https://example.com/clothing.jpg',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-garden' },
      update: {},
      create: {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home improvement and garden supplies',
        image: 'https://example.com/home-garden.jpg',
      },
    }),
  ]);

  // 創建範例商品
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system and A17 Pro chip',
        price: 999.99,
        categoryId: categories[0].id,
        images: [
          'https://example.com/iphone15pro-1.jpg',
          'https://example.com/iphone15pro-2.jpg',
        ],
        stock: 50,
        specifications: {
          storage: '256GB',
          color: 'Natural Titanium',
          screen: '6.1 inch Super Retina XDR',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Air M2',
        description: 'Ultra-thin laptop with M2 chip for incredible performance',
        price: 1199.99,
        categoryId: categories[0].id,
        images: [
          'https://example.com/macbook-air-m2-1.jpg',
          'https://example.com/macbook-air-m2-2.jpg',
        ],
        stock: 30,
        specifications: {
          chip: 'Apple M2',
          memory: '8GB',
          storage: '256GB SSD',
          display: '13.6 inch Liquid Retina',
        },
      },
    }),
  ]);

  console.log('Seed data created successfully!');
  console.log('Admin user:', admin.email);
  console.log('Categories:', categories.length);
  console.log('Products:', products.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 查詢範例

### 複雜查詢範例

#### 1. 獲取熱門商品（按銷售量排序）
```sql
SELECT 
  p.id,
  p.name,
  p.price,
  p.images[1] as main_image,
  COALESCE(SUM(oi.quantity), 0) as total_sold,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as review_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN reviews r ON p.id = r.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.price, p.images
ORDER BY total_sold DESC, average_rating DESC
LIMIT 10;
```

#### 2. 獲取用戶訂單歷史（包含商品詳情）
```sql
SELECT 
  o.id as order_id,
  o.status,
  o.total_amount,
  o.created_at,
  oi.quantity,
  oi.price as item_price,
  p.name as product_name,
  p.images[1] as product_image
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.user_id = $1
ORDER BY o.created_at DESC;
```

#### 3. 搜尋商品（全文搜尋）
```sql
SELECT 
  p.id,
  p.name,
  p.description,
  p.price,
  p.images[1] as main_image,
  ts_rank(to_tsvector('english', p.name || ' ' || p.description), plainto_tsquery('english', $1)) as rank
FROM products p
WHERE p.is_active = true
  AND to_tsvector('english', p.name || ' ' || p.description) @@ plainto_tsquery('english', $1)
ORDER BY rank DESC, p.created_at DESC
LIMIT 20;
```

#### 4. 獲取商品分類統計
```sql
SELECT 
  c.name as category_name,
  c.slug,
  COUNT(p.id) as product_count,
  COALESCE(AVG(p.price), 0) as average_price,
  COALESCE(MIN(p.price), 0) as min_price,
  COALESCE(MAX(p.price), 0) as max_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug
ORDER BY product_count DESC;
```

#### 5. 獲取銷售報表（按月份）
```sql
SELECT 
  DATE_TRUNC('month', o.created_at) as month,
  COUNT(o.id) as order_count,
  SUM(o.total_amount) as total_revenue,
  AVG(o.total_amount) as average_order_value,
  COUNT(DISTINCT o.user_id) as unique_customers
FROM orders o
WHERE o.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
  AND o.created_at >= $1
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;
```

### Prisma 查詢範例

#### 1. 獲取商品列表（包含關聯資料）
```typescript
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    category: {
      isActive: true,
    },
  },
  include: {
    category: true,
    reviews: {
      select: {
        rating: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 20,
});
```

#### 2. 獲取用戶購物車（包含商品詳情）
```typescript
const cart = await prisma.cartItem.findMany({
  where: {
    userId: userId,
  },
  include: {
    product: {
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        stock: true,
      },
    },
  },
});
```

#### 3. 創建訂單（事務處理）
```typescript
const order = await prisma.$transaction(async (tx) => {
  // 創建訂單
  const newOrder = await tx.order.create({
    data: {
      userId,
      totalAmount,
      shippingAddress,
      billingAddress,
      paymentMethod,
      orderItems: {
        create: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  // 更新商品庫存
  await Promise.all(
    orderItems.map(item =>
      tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    )
  );

  return newOrder;
});
```

## 效能優化

### 索引策略
```sql
-- 複合索引
CREATE INDEX idx_products_category_price ON products(category_id, price);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);

-- 部分索引
CREATE INDEX idx_active_products ON products(category_id) WHERE is_active = true;
CREATE INDEX idx_pending_orders ON orders(created_at) WHERE status = 'PENDING';

-- 表達式索引
CREATE INDEX idx_products_lower_name ON products(lower(name));
CREATE INDEX idx_users_email_domain ON users(split_part(email, '@', 2));
```

### 查詢優化
```sql
-- 使用 EXPLAIN ANALYZE 分析查詢效能
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 'cat123' AND price < 100;

-- 使用 LIMIT 限制結果集
SELECT * FROM products ORDER BY created_at DESC LIMIT 20;

-- 使用適當的 JOIN 類型
SELECT p.*, c.name as category_name 
FROM products p 
INNER JOIN categories c ON p.category_id = c.id 
WHERE p.is_active = true;
```

### 連線池設定
```typescript
// config/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// 連線池設定
const connectionPool = {
  max: 20, // 最大連線數
  min: 5,  // 最小連線數
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
};

export default prisma;
```

這個資料庫架構設計提供了完整的電商平台資料模型，包含用戶管理、商品管理、訂單處理等核心功能，同時注重效能優化和資料完整性。


