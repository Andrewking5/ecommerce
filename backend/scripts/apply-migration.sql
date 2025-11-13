-- Apply migration directly to database
-- AlterTable: Add new fields to products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "model3dUrl" TEXT;

-- AlterTable: Add new fields to orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingCost" DECIMAL(10,2);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "taxAmount" DECIMAL(10,2);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(10,2);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;

-- AlterTable: Add new fields to reviews
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "helpfulCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Add new fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "viewedProducts" JSONB;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferences" JSONB;

