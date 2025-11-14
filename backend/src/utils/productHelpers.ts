import { prisma } from '../app';

/**
 * 统一图片数组处理逻辑
 * 将各种格式的图片数据转换为标准化的字符串数组
 * 支持数组、逗号分隔的字符串、单个URL字符串
 */
export function normalizeImages(images: any): string[] {
  if (Array.isArray(images)) {
    return images
      .filter((img: any) => img !== null && img !== undefined && img !== '')
      .map((img: any) => String(img).trim())
      .filter((img: string) => img.length > 0);
  }
  
  if (images !== null && images !== undefined && images !== '') {
    const imageStr = String(images).trim();
    if (imageStr.length > 0) {
      // 支持逗号分隔的多个URL（与前端保持一致）
      return imageStr.split(',')
        .map((url: string) => url.trim())
        .filter((url: string) => url.length > 0);
    }
  }
  
  return [];
}

/**
 * 统一库存数字转换逻辑
 * 确保库存是非负整数
 */
export function normalizeStock(stock: any): number {
  if (typeof stock === 'number') {
    return Math.max(0, Math.floor(stock));
  }
  
  if (stock !== undefined && stock !== null && stock !== '') {
    // 如果是字符串，先清理再转换
    if (typeof stock === 'string') {
      const cleaned = stock.replace(/[^\d.-]/g, '');
      const num = Number(cleaned);
      if (!isNaN(num)) {
        return Math.max(0, Math.floor(num));
      }
    } else {
      const num = Number(stock);
      if (!isNaN(num)) {
        return Math.max(0, Math.floor(num));
      }
    }
  }
  
  return 0;
}

/**
 * 统一分类解析逻辑
 * 支持 categoryId、category slug、category name 三种方式
 * @param categoryIdentifier - 分类标识符（可能是 ID、slug 或 name）
 * @param categoryMaps - 可选的分类映射（用于批量操作时提升性能）
 * @returns 分类 ID 或 null
 */
export async function resolveCategoryId(
  categoryIdentifier: string | undefined,
  categoryMaps?: {
    byId?: Map<string, { id: string; slug: string; name: string }>;
    bySlug?: Map<string, { id: string; slug: string; name: string }>;
    byName?: Map<string, { id: string; slug: string; name: string }>;
  }
): Promise<string | null> {
  if (!categoryIdentifier) {
    return null;
  }

  // 如果提供了分类映射，优先使用（批量操作时提升性能）
  if (categoryMaps) {
    // 先尝试作为 ID 查找
    if (categoryMaps.byId?.has(categoryIdentifier)) {
      return categoryMaps.byId.get(categoryIdentifier)!.id;
    }
    
    // 再尝试作为 slug 查找
    if (categoryMaps.bySlug?.has(categoryIdentifier)) {
      return categoryMaps.bySlug.get(categoryIdentifier)!.id;
    }
    
    // 最后尝试作为 name 查找（不区分大小写）
    const nameLower = categoryIdentifier.toLowerCase();
    if (categoryMaps.byName?.has(nameLower)) {
      return categoryMaps.byName.get(nameLower)!.id;
    }
  }

  // 如果没有提供映射，查询数据库
  // 先尝试作为 ID 查找
  let category = await prisma.category.findUnique({
    where: { id: categoryIdentifier },
    select: { id: true },
  });

  if (category) {
    return category.id;
  }

  // 再尝试作为 slug 查找
  category = await prisma.category.findUnique({
    where: { slug: categoryIdentifier },
    select: { id: true },
  });

  if (category) {
    return category.id;
  }

  // 最后尝试作为 name 查找（不区分大小写）
  const categories = await prisma.category.findMany({
    where: {
      name: {
        equals: categoryIdentifier,
        mode: 'insensitive',
      },
    },
    select: { id: true },
    take: 1,
  });

  if (categories.length > 0) {
    return categories[0].id;
  }

  return null;
}

/**
 * 统一商品数据验证逻辑
 */
export interface ProductValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ProductData {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  category?: string;
  stock?: number;
  images?: any;
  specifications?: any;
  isActive?: boolean;
  hasVariants?: boolean;
  basePrice?: number;
}

export function validateProductData(
  productData: ProductData,
  options: {
    requireDescription?: boolean;
    requireCategory?: boolean;
    requirePrice?: boolean;
    requireStock?: boolean;
    checkNameUniqueness?: boolean;
  } = {}
): ProductValidationResult {
  const errors: string[] = [];
  const {
    requireDescription = true,
    requireCategory = true,
    requirePrice = true,
    requireStock = false,
    checkNameUniqueness = false,
  } = options;

  // 验证商品名称
  if (!productData.name || String(productData.name).trim().length === 0) {
    errors.push('商品名称是必填字段');
  } else if (checkNameUniqueness) {
    // 名称唯一性检查将在业务层进行，这里只做格式验证
    const name = String(productData.name).trim();
    if (name.length < 1 || name.length > 200) {
      errors.push('商品名称长度必须在1-200个字符之间');
    }
  }

  // 验证商品描述
  if (requireDescription) {
    if (!productData.description || String(productData.description).trim().length === 0) {
      errors.push('商品描述是必填字段');
    }
  }

  // 验证价格
  if (requirePrice) {
    if (productData.price === undefined || productData.price === null) {
      errors.push('价格是必填字段');
    } else {
      const price = Number(productData.price);
      if (isNaN(price) || price <= 0) {
        errors.push('价格必须是大于0的数字');
      }
    }
  }

  // 验证分类
  if (requireCategory) {
    if (!productData.categoryId && !productData.category) {
      errors.push('分类是必填字段');
    }
  }

  // 验证库存
  if (requireStock) {
    if (productData.stock === undefined || productData.stock === null) {
      errors.push('库存是必填字段');
    } else {
      const stock = normalizeStock(productData.stock);
      if (stock < 0) {
        errors.push('库存必须是非负整数');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 检查商品名称是否已存在
 */
export async function checkProductNameExists(name: string, excludeId?: string): Promise<boolean> {
  const trimmedName = String(name).trim();
  if (trimmedName.length === 0) {
    return false;
  }

  // 添加调试日志
  console.log(`🔍 [checkProductNameExists] 检查名称: "${trimmedName}"${excludeId ? ` (排除ID: ${excludeId})` : ''}`);
  
  // 只检查活跃的商品（isActive=true），排除已软删除的商品
  const existing = await prisma.product.findFirst({
    where: {
      name: trimmedName,
      isActive: true, // 只检查活跃的商品，排除已软删除的商品
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, name: true, isActive: true },
  });

  if (existing) {
    console.log(`✅ [checkProductNameExists] 找到已存在的活跃商品:`, { id: existing.id, name: existing.name, isActive: existing.isActive });
  } else {
    // 检查是否有已删除的商品（用于调试）
    const deletedProduct = await prisma.product.findFirst({
      where: {
        name: trimmedName,
        isActive: false,
      },
      select: { id: true, name: true, isActive: true },
    });
    if (deletedProduct) {
      console.log(`ℹ️ [checkProductNameExists] 找到已删除的商品（isActive=false）:`, { id: deletedProduct.id, name: deletedProduct.name, isActive: deletedProduct.isActive });
      console.log(`ℹ️ [checkProductNameExists] 该商品已被软删除，不影响新商品创建`);
    } else {
      console.log(`❌ [checkProductNameExists] 商品名称 "${trimmedName}" 不存在（包括已删除的）`);
    }
  }

  return !!existing;
}

