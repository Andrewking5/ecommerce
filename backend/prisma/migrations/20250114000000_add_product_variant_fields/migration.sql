-- AlterTable: Add variant-related fields to products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "hasVariants" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "basePrice" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "minPrice" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "maxPrice" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_hasVariants_idx" ON "products"("hasVariants");

-- CreateEnum: AttributeType
DO $$ BEGIN
 CREATE TYPE "AttributeType" AS ENUM('TEXT', 'COLOR', 'IMAGE', 'SELECT', 'NUMBER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable: product_attributes
CREATE TABLE IF NOT EXISTS "product_attributes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "type" "AttributeType" NOT NULL,
    "categoryId" TEXT,
    "values" JSONB NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: product_variants
CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "comparePrice" DECIMAL(10,2),
    "costPrice" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "weight" DECIMAL(10,2),
    "dimensions" JSONB,
    "barcode" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable: product_variant_attributes
CREATE TABLE IF NOT EXISTS "product_variant_attributes" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "displayValue" TEXT,

    CONSTRAINT "product_variant_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: product_attribute_templates
CREATE TABLE IF NOT EXISTS "product_attribute_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    "attributes" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_attribute_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: user_addresses
CREATE TABLE IF NOT EXISTS "user_addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "zipCode" TEXT,
    "label" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add variantId to order_items
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variantId" TEXT;

-- AlterTable: Add variantId to cart_items
ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "variantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_sku_key" ON "product_variants"("sku");
CREATE INDEX IF NOT EXISTS "product_attributes_categoryId_idx" ON "product_attributes"("categoryId");
CREATE INDEX IF NOT EXISTS "product_attributes_name_idx" ON "product_attributes"("name");
CREATE INDEX IF NOT EXISTS "product_variants_productId_idx" ON "product_variants"("productId");
CREATE INDEX IF NOT EXISTS "product_variants_sku_idx" ON "product_variants"("sku");
CREATE INDEX IF NOT EXISTS "product_variants_isActive_idx" ON "product_variants"("isActive");
CREATE INDEX IF NOT EXISTS "product_variants_productId_isActive_idx" ON "product_variants"("productId", "isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "product_variant_attributes_variantId_attributeId_key" ON "product_variant_attributes"("variantId", "attributeId");
CREATE INDEX IF NOT EXISTS "product_variant_attributes_variantId_idx" ON "product_variant_attributes"("variantId");
CREATE INDEX IF NOT EXISTS "product_variant_attributes_attributeId_idx" ON "product_variant_attributes"("attributeId");
CREATE INDEX IF NOT EXISTS "product_attribute_templates_categoryId_idx" ON "product_attribute_templates"("categoryId");
CREATE INDEX IF NOT EXISTS "product_attribute_templates_isDefault_idx" ON "product_attribute_templates"("isDefault");
CREATE INDEX IF NOT EXISTS "user_addresses_userId_idx" ON "user_addresses"("userId");

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_variant_attributes" ADD CONSTRAINT "product_variant_attributes_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_variant_attributes" ADD CONSTRAINT "product_variant_attributes_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "product_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_attribute_templates" ADD CONSTRAINT "product_attribute_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

