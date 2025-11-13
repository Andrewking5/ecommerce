import { Request, Response } from 'express';
import { prisma } from '../app';
import { asyncHandler, sendErrorResponse, AppError } from '../utils/errorHandler';
import {
  CreateVariantRequest,
  UpdateVariantRequest,
  CreateVariantsBulkRequest,
  GenerateSKURequest,
} from '../types/variant';

export class VariantController {
  // 獲取商品的所有變體
  static getProductVariants = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;
    const { isActive } = req.query;

    // 驗證商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const where: any = { productId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        attributes: {
          include: {
            attribute: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: variants,
    });
  });

  // 獲取單個變體
  static getVariantById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        attributes: {
          include: {
            attribute: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!variant) {
      throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
    }

    res.json({
      success: true,
      data: variant,
    });
  });

  // 創建單個變體（管理員）
  static createVariant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: CreateVariantRequest = req.body;

    // 驗證必填字段
    if (!data.productId || !data.sku || data.price === undefined || data.stock === undefined) {
      throw new AppError('Product ID, SKU, price, and stock are required', 400, 'VALIDATION_ERROR');
    }

    // 驗證商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // 檢查 SKU 是否已存在
    const existingVariant = await prisma.productVariant.findUnique({
      where: { sku: data.sku },
    });

    if (existingVariant) {
      throw new AppError('SKU already exists', 400, 'DUPLICATE_SKU');
    }

    // 驗證屬性是否存在
    if (data.attributes && data.attributes.length > 0) {
      for (const attr of data.attributes) {
        const attribute = await prisma.productAttribute.findUnique({
          where: { id: attr.attributeId },
        });

        if (!attribute) {
          throw new AppError(`Attribute ${attr.attributeId} not found`, 404, 'ATTRIBUTE_NOT_FOUND');
        }
      }
    }

    // 如果設置為默認變體，取消其他默認變體
    if (data.isDefault) {
      await prisma.productVariant.updateMany({
        where: {
          productId: data.productId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // 創建變體
    const variant = await prisma.productVariant.create({
      data: {
        productId: data.productId,
        sku: data.sku,
        price: data.price,
        comparePrice: data.comparePrice,
        costPrice: data.costPrice,
        stock: data.stock,
        reservedStock: data.reservedStock ?? 0,
        weight: data.weight,
        dimensions: data.dimensions,
        barcode: data.barcode,
        images: data.images || [],
        isDefault: data.isDefault ?? false,
        isActive: data.isActive ?? true,
        attributes: {
          create: data.attributes?.map((attr) => ({
            attributeId: attr.attributeId,
            value: attr.value,
            displayValue: attr.displayValue,
          })) || [],
        },
      },
      include: {
        attributes: {
          include: {
            attribute: true,
          },
        },
      },
    });

    // 更新商品變體價格範圍
    await VariantController.updateProductPriceRange(data.productId);

    // 如果這是第一個變體，更新商品的 hasVariants 標記
    const variantCount = await prisma.productVariant.count({
      where: { productId: data.productId },
    });

    if (variantCount === 1) {
      await prisma.product.update({
        where: { id: data.productId },
        data: { hasVariants: true },
      });
    }

    res.status(201).json({
      success: true,
      data: variant,
    });
  });

  // 批量創建變體（管理員）- 自動生成所有組合
  static createVariantsBulk = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: CreateVariantsBulkRequest = req.body;

    // 驗證必填字段
    if (!data.productId || !data.attributes || data.attributes.length === 0) {
      throw new AppError('Product ID and attributes are required', 400, 'VALIDATION_ERROR');
    }

    // 驗證商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // 驗證所有屬性是否存在
    const attributeIds = data.attributes.map((attr) => attr.attributeId);
    const attributes = await prisma.productAttribute.findMany({
      where: {
        id: { in: attributeIds },
      },
    });

    if (attributes.length !== attributeIds.length) {
      throw new AppError('One or more attributes not found', 404, 'ATTRIBUTE_NOT_FOUND');
    }

    // 生成所有屬性組合
    const combinations = VariantController.generateAttributeCombinations(data.attributes);

    // 计算变体价格的辅助函数
    const calculateVariantPrice = (combination: Array<{ attributeId: string; value: string }>): number => {
      // 如果提供了直接的价格映射，优先使用
      if (data.variantPrices && data.variantPrices.length > 0) {
        const matchedPrice = data.variantPrices.find((vp) => {
          if (vp.combination.length !== combination.length) return false;
          return vp.combination.every((vpAttr) =>
            combination.some((cAttr) => cAttr.attributeId === vpAttr.attributeId && cAttr.value === vpAttr.value)
          );
        });
        if (matchedPrice) return matchedPrice.price;
      }

      // 否则使用基础价格 + 价格规则
      let price = data.basePrice || Number(product.price);
      
      if (data.priceRules && typeof data.priceRules === 'object') {
        combination.forEach((attr) => {
          const attributeRules = data.priceRules![attr.attributeId];
          if (attributeRules && typeof attributeRules === 'object') {
            const rule = attributeRules[attr.value];
            if (rule !== undefined && typeof rule === 'number') {
              price += rule; // 可以是正数（加价）或负数（减价）
            }
          }
        });
      }
      
      return Math.max(0, price); // 确保价格不为负
    };

    // 生成變體數據
    const variantsToCreate = combinations.map((combination, index) => {
      // 生成 SKU（如果沒有提供模式，使用默認模式）
      const sku = data.skuPattern
        ? VariantController.generateSKUFromPattern(data.skuPattern, combination, product.name)
        : `${product.name.toUpperCase().replace(/\s+/g, '-')}-${index + 1}`;

      // 计算变体价格
      const variantPrice = calculateVariantPrice(combination);

      return {
        productId: data.productId,
        sku,
        price: variantPrice,
        stock: data.defaultStock ?? 0,
        isDefault: index === 0, // 第一個變體設為默認
        isActive: true,
        attributes: {
          create: combination.map((attr) => ({
            attributeId: attr.attributeId,
            value: attr.value,
          })),
        },
      };
    });

    // 批量創建變體
    const createdVariants = await prisma.$transaction(
      variantsToCreate.map((variantData) =>
        prisma.productVariant.create({
          data: variantData,
          include: {
            attributes: {
              include: {
                attribute: true,
              },
            },
          },
        })
      )
    );

    // 更新商品變體價格範圍和 hasVariants 標記
    await prisma.product.update({
      where: { id: data.productId },
      data: {
        hasVariants: true,
      },
    });
    await VariantController.updateProductPriceRange(data.productId);

    res.status(201).json({
      success: true,
      data: createdVariants,
      count: createdVariants.length,
    });
  });

  // 更新變體（管理員）
  static updateVariant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data: UpdateVariantRequest = req.body;

    // 檢查變體是否存在
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existingVariant) {
      throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
    }

    // 如果更新 SKU，檢查是否重複
    if (data.sku && data.sku !== existingVariant.sku) {
      const duplicateVariant = await prisma.productVariant.findUnique({
        where: { sku: data.sku },
      });

      if (duplicateVariant) {
        throw new AppError('SKU already exists', 400, 'DUPLICATE_SKU');
      }
    }

    // 如果設置為默認變體，取消其他默認變體
    if (data.isDefault) {
      await prisma.productVariant.updateMany({
        where: {
          productId: existingVariant.productId,
          id: { not: id },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // 如果更新屬性，驗證屬性是否存在
    if (data.attributes) {
      for (const attr of data.attributes) {
        const attribute = await prisma.productAttribute.findUnique({
          where: { id: attr.attributeId },
        });

        if (!attribute) {
          throw new AppError(`Attribute ${attr.attributeId} not found`, 404, 'ATTRIBUTE_NOT_FOUND');
        }
      }
    }

    // 更新變體
    const updateData: any = {
      ...(data.sku && { sku: data.sku }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.comparePrice !== undefined && { comparePrice: data.comparePrice }),
      ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.reservedStock !== undefined && { reservedStock: data.reservedStock }),
      ...(data.weight !== undefined && { weight: data.weight }),
      ...(data.dimensions !== undefined && { dimensions: data.dimensions }),
      ...(data.barcode !== undefined && { barcode: data.barcode }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    // 如果更新屬性，先刪除舊屬性，再創建新屬性
    if (data.attributes) {
      await prisma.productVariantAttribute.deleteMany({
        where: { variantId: id },
      });

      updateData.attributes = {
        create: data.attributes.map((attr) => ({
          attributeId: attr.attributeId,
          value: attr.value,
          displayValue: attr.displayValue,
        })),
      };
    }

    const variant = await prisma.productVariant.update({
      where: { id },
      data: updateData,
      include: {
        attributes: {
          include: {
            attribute: true,
          },
        },
      },
    });

    // 更新商品變體價格範圍
    await VariantController.updateProductPriceRange(existingVariant.productId);

    res.json({
      success: true,
      data: variant,
    });
  });

  // 批量更新變體（管理員）
  static updateVariantsBulk = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { variantIds, data } = req.body;

    if (!variantIds || !Array.isArray(variantIds) || variantIds.length === 0) {
      throw new AppError('Variant IDs array is required', 400, 'VALIDATION_ERROR');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new AppError('Update data is required', 400, 'VALIDATION_ERROR');
    }

    // 批量更新
    const result = await prisma.productVariant.updateMany({
      where: {
        id: { in: variantIds },
      },
      data: {
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    // 獲取第一個變體的 productId 以更新價格範圍
    const firstVariant = await prisma.productVariant.findFirst({
      where: { id: { in: variantIds } },
    });

    if (firstVariant) {
      await VariantController.updateProductPriceRange(firstVariant.productId);
    }

    res.json({
      success: true,
      message: `${result.count} variant(s) updated`,
      count: result.count,
    });
  });

  // 刪除變體（管理員）
  static deleteVariant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // 檢查變體是否存在
    const variant = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
    }

    const productId = variant.productId;

    // 刪除變體（級聯刪除屬性關聯）
    await prisma.productVariant.delete({
      where: { id },
    });

    // 檢查是否還有其他變體
    const remainingVariants = await prisma.productVariant.count({
      where: { productId },
    });

    // 如果沒有變體了，更新商品的 hasVariants 標記
    if (remainingVariants === 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { hasVariants: false },
      });
    } else {
      // 更新商品變體價格範圍
      await VariantController.updateProductPriceRange(productId);
    }

    res.json({
      success: true,
      message: 'Variant deleted successfully',
    });
  });

  // 生成 SKU
  static generateSKU = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: GenerateSKURequest = req.body;

    if (!data.pattern || !data.attributes || data.attributes.length === 0) {
      throw new AppError('Pattern and attributes are required', 400, 'VALIDATION_ERROR');
    }

    // 獲取商品信息
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // 獲取屬性信息
    const attributeIds = data.attributes.map((attr) => attr.attributeId);
    const attributes = await prisma.productAttribute.findMany({
      where: {
        id: { in: attributeIds },
      },
    });

    if (attributes.length !== attributeIds.length) {
      throw new AppError('One or more attributes not found', 404, 'ATTRIBUTE_NOT_FOUND');
    }

    // 生成 SKU
    const sku = VariantController.generateSKUFromPattern(
      data.pattern,
      data.attributes.map((attr) => {
        const attribute = attributes.find((a) => a.id === attr.attributeId);
        return {
          attributeId: attr.attributeId,
          attributeName: attribute?.name || '',
          value: attr.value,
        };
      }),
      product.name
    );

    res.json({
      success: true,
      data: { sku },
    });
  });

  // 輔助方法：生成屬性組合
  private static generateAttributeCombinations(
    attributes: Array<{ attributeId: string; values: string[] }>
  ): Array<Array<{ attributeId: string; value: string }>> {
    if (attributes.length === 0) return [[]];

    const [first, ...rest] = attributes;
    const restCombinations = VariantController.generateAttributeCombinations(rest);

    const combinations: Array<Array<{ attributeId: string; value: string }>> = [];

    for (const value of first.values) {
      for (const restCombination of restCombinations) {
        combinations.push([
          { attributeId: first.attributeId, value },
          ...restCombination,
        ]);
      }
    }

    return combinations;
  }

  // 輔助方法：從模式生成 SKU
  private static generateSKUFromPattern(
    pattern: string,
    attributes: Array<{ attributeId?: string; attributeName?: string; value: string }>,
    productName: string
  ): string {
    let sku = pattern;

    // 替換產品名稱
    sku = sku.replace(/{product}/gi, productName.toUpperCase().replace(/\s+/g, '-'));

    // 替換屬性值
    attributes.forEach((attr) => {
      const attrName = attr.attributeName || attr.attributeId || '';
      const attrKey = `{${attrName.toLowerCase()}}`;
      const valueKey = `{${attrName.toLowerCase()}-value}`;

      sku = sku.replace(new RegExp(attrKey, 'gi'), attrName.toUpperCase().replace(/\s+/g, '-'));
      sku = sku.replace(new RegExp(valueKey, 'gi'), attr.value.toUpperCase().replace(/\s+/g, '-'));
    });

    // 清理特殊字符
    sku = sku.replace(/[^A-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    return sku;
  }

  // 輔助方法：更新商品價格範圍
  private static async updateProductPriceRange(productId: string): Promise<void> {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId,
        isActive: true,
      },
      select: {
        price: true,
      },
    });

    if (variants.length === 0) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          minPrice: null,
          maxPrice: null,
        },
      });
      return;
    }

    const prices = variants.map((v) => Number(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    await prisma.product.update({
      where: { id: productId },
      data: {
        minPrice,
        maxPrice,
      },
    });
  }

  // 更新变体顺序
  static updateVariantsOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { variantIds } = req.body;

    // 验证所有变体都属于同一个商品
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, productId: true },
    });

    if (variants.length !== variantIds.length) {
      throw new AppError('Some variants not found', 404, 'VARIANTS_NOT_FOUND');
    }

    const productIds = new Set(variants.map((v) => v.productId));
    if (productIds.size > 1) {
      throw new AppError('All variants must belong to the same product', 400, 'INVALID_VARIANTS');
    }

    // 批量更新顺序
    const updatePromises = variantIds.map((variantId: string, index: number) =>
      prisma.productVariant.update({
        where: { id: variantId },
        data: { displayOrder: index },
      })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Variants order updated successfully',
    });
  });
}

