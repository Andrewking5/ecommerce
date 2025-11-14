import { Request, Response } from 'express';
import { prisma } from '../app';
import { ProductWithRelations, ReviewWithRating } from '../types/prisma';
import { CacheService, CACHE_KEYS } from '../services/cacheService';
import { asyncHandler, sendErrorResponse, handlePrismaError } from '../utils/errorHandler';
import { normalizeImages, normalizeStock, resolveCategoryId, checkProductNameExists } from '../utils/productHelpers';
import { Prisma } from '@prisma/client';

export class ProductController {
  // 獲取商品列表
  static async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        categoryId,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minPrice,
        maxPrice,
        stockStatus, // 'in_stock', 'out_of_stock', 'low_stock'
        isActive, // 用于管理员筛选
        minStock,
        maxStock,
        startDate,
        endDate,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // 建構查詢條件
      const where: any = {};

      // 如果不是管理员，只显示活跃商品
      const authReq = req as any;
      if (!authReq.user || authReq.user.role !== 'ADMIN') {
        where.isActive = true;
      } else if (isActive !== undefined) {
        // 管理员可以筛选状态
        const isActiveValue = String(isActive).toLowerCase();
        where.isActive = isActiveValue === 'true';
      }

      // 分类筛选
      if (categoryId) {
        where.categoryId = categoryId as string;
      } else if (category) {
        where.category = { slug: category };
      }

      // 搜索
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { id: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // 价格筛选
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
      }

      // 库存筛选
      if (stockStatus) {
        switch (stockStatus) {
          case 'in_stock':
            where.stock = { gt: 0 };
            break;
          case 'out_of_stock':
            where.stock = { lte: 0 };
            break;
          case 'low_stock':
            where.stock = { gt: 0, lte: 10 }; // 低库存定义为 <= 10
            break;
        }
      }

      // 库存范围筛选
      if (minStock !== undefined || maxStock !== undefined) {
        where.stock = {};
        if (minStock !== undefined) where.stock.gte = Number(minStock);
        if (maxStock !== undefined) where.stock.lte = Number(maxStock);
      }

      // 日期范围筛选
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string);
        }
      }

      // 驗證 sortBy 字段
      const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'price', 'stock'];
      const sortField = allowedSortFields.includes(sortBy as string) 
        ? (sortBy as string) 
        : 'createdAt';
      const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';

      // 生成缓存键（仅对公开查询使用缓存）
      const isPublicQuery = !authReq.user || authReq.user.role !== 'ADMIN';
      const cacheKey = isPublicQuery 
        ? CacheService.generateKey(CACHE_KEYS.PRODUCTS, {
            page: Number(page),
            limit: Number(limit),
            category: category || categoryId || '',
            search: search || '',
            sortBy: sortField,
            sortOrder: sortDirection,
            minPrice: minPrice || '',
            maxPrice: maxPrice || '',
          })
        : null;

      // 尝试从缓存获取（仅公开查询）
      if (cacheKey && isPublicQuery) {
        const cached = CacheService.get<any>(cacheKey);
        if (cached) {
          res.json({
            success: true,
            data: cached,
          });
          return;
        }
      }

      // 執行查詢
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { [sortField]: sortDirection },
          include: {
            category: true,
            reviews: {
              select: {
                rating: true,
              },
            },
            variants: {
              where: { isActive: true },
              select: {
                id: true,
                stock: true,
              },
            },
          },
        }),
        prisma.product.count({ where }),
      ]);

      // 計算平均評分和库存（对于有变体的商品，使用变体的总库存）
      const productsWithRating = products.map((product: any) => {
        // 计算变体总库存
        let displayStock = product.stock;
        if (product.hasVariants && product.variants && product.variants.length > 0) {
          // 对于有变体的商品，使用变体的总库存
          displayStock = product.variants.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0);
        }
        
        return {
          ...product,
          stock: displayStock, // 覆盖主商品的库存，使用变体总库存（如果有变体）
          averageRating: product.reviews.length > 0
            ? product.reviews.reduce((sum: number, review: ReviewWithRating) => sum + review.rating, 0) / product.reviews.length
            : 0,
          reviewCount: product.reviews.length,
        };
      });

      const responseData = {
        products: productsWithRating,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      };

      // 缓存结果（仅公开查询，缓存2分钟）
      if (cacheKey && isPublicQuery) {
        CacheService.set(cacheKey, responseData, 120);
      }

      res.json({
        success: true,
        data: responseData,
      });
      return;
    } catch (error: any) {
      // 处理 Prisma 错误
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const appError = handlePrismaError(error);
        sendErrorResponse(res, appError, req);
        return;
      }
      sendErrorResponse(res, error, req);
      return;
    }
  }

  // 獲取單一商品
  static async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // 尝试从缓存获取（缓存3分钟）
      const cacheKey = `${CACHE_KEYS.PRODUCT}:${id}`;
      const cached = CacheService.get<any>(cacheKey);
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // 尝试查询产品，如果 variants 表不存在则只查询基本信息
      let product;
      try {
        product = await prisma.product.findUnique({
          where: { id, isActive: true },
          include: {
            category: true,
            variants: {
              where: { isActive: true },
              include: {
                attributes: {
                  include: {
                    attribute: true,
                  },
                },
              },
              orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'asc' },
              ],
            },
            reviews: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 50, // 限制评论数量，避免数据过大
            },
          },
        });
      } catch (variantError: any) {
        // 如果 variants 查询失败（表不存在或字段不匹配），尝试不包含 variants
        console.warn('⚠️  Variants query failed, trying without variants:', variantError?.message);
        product = await prisma.product.findUnique({
          where: { id, isActive: true },
          include: {
            category: true,
            reviews: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
        });
        // 如果产品存在但没有 variants，添加空数组
        if (product) {
          (product as any).variants = [];
        }
      }

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      // 缓存商品详情（3分钟）
      CacheService.set(cacheKey, product, 180);

      res.json({
        success: true,
        data: product,
      });
      return;
    } catch (error: any) {
      console.error('Get product error:', {
        message: error?.message,
        code: error?.code,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
      
      // 处理 Prisma 错误
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const appError = handlePrismaError(error);
        sendErrorResponse(res, appError, req);
        return;
      }
      
      sendErrorResponse(res, error, req);
      return;
    }
  }

  // 搜尋商品
  static async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({
          success: false,
          message: req.t('validation:required', { field: 'Search query' }),
        });
        return;
      }

      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q as string, mode: 'insensitive' } },
            { description: { contains: q as string, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
        },
        take: 20,
      });

      res.json({
        success: true,
        data: products,
      });
      return;
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        message: req.t('common:errors.internalServerError'),
      });
      return;
    }
  }

  // 獲取商品分類
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: categories,
      });
      return;
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: req.t('common:errors.internalServerError'),
      });
      return;
    }
  }

  // 創建商品（管理員）
  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = req.body;
      const userId = (req as any).user.id;

      // 驗證必要字段
      if (!productData.name || !productData.description || productData.price === undefined) {
        res.status(400).json({
          success: false,
          message: req.t('products:errors.missingFields'),
        });
        return;
      }

      // 檢查商品名稱唯一性
      const nameExists = await checkProductNameExists(productData.name);
      if (nameExists) {
        // 确保错误信息是中文，不使用国际化key
        const errorMessage = `商品名称 "${productData.name}" 已存在，请修改商品名称`;
        res.status(400).json({
          success: false,
          message: errorMessage,
        });
        return;
      }

      // 處理分類：使用共享工具函数
      const categoryId = await resolveCategoryId(
        productData.categoryId || productData.category
      );

      if (!categoryId) {
        res.status(400).json({
          success: false,
          message: req.t('categories:errors.notFound'),
        });
        return;
      }

      // 使用共享工具函数处理图片和库存
      const images = normalizeImages(productData.images);
      const stock = normalizeStock(productData.stock);

      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          categoryId: categoryId,
          images: images,
          stock: stock,
          specifications: productData.specifications || {},
          isActive: productData.isActive !== undefined ? productData.isActive : true,
          // 变体相关字段
          hasVariants: productData.hasVariants ?? false,
          basePrice: productData.basePrice || productData.price,
          minPrice: productData.minPrice,
          maxPrice: productData.maxPrice,
        },
        include: {
          category: true,
        },
      });

      // 清除相关缓存
      CacheService.delete(CACHE_KEYS.CATEGORIES);
      CacheService.deleteByPrefix(CACHE_KEYS.PRODUCTS);

      res.status(201).json({
        success: true,
        message: req.t('products:success.created'),
        data: product,
      });
      return;
    } catch (error: any) {
      console.error('Create product error:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
      });
      
      // 处理 Prisma 唯一约束错误
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // 唯一约束违反（通常是商品名称）
          // 确保错误信息是中文，不使用国际化key
          const errorMessage = `商品名称 "${req.body.name}" 已存在，请修改商品名称`;
          res.status(400).json({
            success: false,
            message: errorMessage,
          });
          return;
        }
      }
      
      res.status(500).json({
        success: false,
        message: error?.message || req.t('common:errors.internalServerError'),
      });
      return;
    }
  }

  // 批量創建商品（管理員）
  static async createProductsBulk(req: Request, res: Response): Promise<void> {
    try {
      const productsData = req.body.products || [];
      const userId = (req as any).user.id;

      if (!Array.isArray(productsData) || productsData.length === 0) {
        res.status(400).json({
          success: false,
          message: req.t('products:errors.invalidBulkData'),
        });
        return;
      }

      // 限制批量创建数量
      if (productsData.length > 100) {
        res.status(400).json({
          success: false,
          message: req.t('products:errors.bulkLimitExceeded', { limit: 100 }),
        });
        return;
      }

      const results = {
        success: [] as any[],
        failed: [] as Array<{ index: number; data: any; error: string }>,
      };

      // 获取所有分类，用于快速查找
      const categories = await prisma.category.findMany({
        select: { id: true, slug: true, name: true },
      });
      const categoryMaps = {
        byId: new Map(categories.map(c => [c.id, c])),
        bySlug: new Map(categories.map(c => [c.slug, c])),
        byName: new Map(categories.map(c => [c.name.toLowerCase(), c])),
      };

      // 批量创建商品
      // 先检查所有商品名称，避免在同一批请求中重复检查
      const productNamesInBatch = new Set<string>();
      const duplicateNamesInBatch = new Set<string>();
      
      // 第一遍：检查同一批请求中的重复
      for (let i = 0; i < productsData.length; i++) {
        const productData = productsData[i];
        const trimmedName = String(productData.name || '').trim().toLowerCase();
        if (trimmedName) {
          if (productNamesInBatch.has(trimmedName)) {
            duplicateNamesInBatch.add(trimmedName);
          } else {
            productNamesInBatch.add(trimmedName);
          }
        }
      }
      
      console.log(`📋 [批量创建] 总共 ${productsData.length} 个商品，同一批请求中有 ${duplicateNamesInBatch.size} 个重复名称:`, Array.from(duplicateNamesInBatch));
      
      // 批量创建商品
      for (let i = 0; i < productsData.length; i++) {
        const productData = productsData[i];
        
        try {
          // 驗證必要字段
          if (!productData.name || !productData.description || productData.price === undefined) {
            results.failed.push({
              index: i + 1,
              data: productData,
              error: req.t('products:errors.missingFields'),
            });
            continue;
          }

          // 先检查同一批请求中的重复
          const trimmedName = String(productData.name || '').trim().toLowerCase();
          if (duplicateNamesInBatch.has(trimmedName)) {
            const errorMessage = `商品名称 "${productData.name}" 在同一批导入中重复，请修改商品名称`;
            results.failed.push({
              index: i + 1,
              data: productData,
              error: errorMessage,
            });
            console.log(`⚠️ [批量创建] 商品索引 ${i + 1} "${productData.name}" 在同一批请求中重复`);
            continue;
          }

          // 檢查商品名稱唯一性（检查数据库中是否已存在）
          // 添加调试日志
          console.log(`🔍 [商品名称检查] 检查商品 "${productData.name}" 是否已在数据库中存在...`);
          const nameExists = await checkProductNameExists(productData.name);
          console.log(`🔍 [商品名称检查] 商品 "${productData.name}" 检查结果: ${nameExists ? '已存在' : '不存在'}`);
          
          if (nameExists) {
            // 如果检查到已存在，再次查询确认（用于调试）
            const existingProduct = await prisma.product.findFirst({
              where: { name: productData.name.trim() },
              select: { id: true, name: true, createdAt: true },
            });
            console.log(`⚠️ [商品名称检查] 找到已存在的商品:`, existingProduct);
            
            // 确保错误信息是中文，不使用国际化key
            const errorMessage = `商品名称 "${productData.name}" 已存在，请修改商品名称`;
            results.failed.push({
              index: i + 1,
              data: productData,
              error: errorMessage,
            });
            continue;
          }
          
          // 如果检查通过，将该商品名称添加到已处理列表（避免后续重复检查）
          productNamesInBatch.add(trimmedName);

          // 處理分類：使用共享工具函数
          const categoryId = await resolveCategoryId(
            productData.categoryId || productData.category,
            categoryMaps
          );

          if (!categoryId) {
            results.failed.push({
              index: i + 1,
              data: productData,
              error: req.t('categories:errors.notFound'),
            });
            continue;
          }

          // 使用共享工具函数处理图片和库存
          const images = normalizeImages(productData.images);
          const stock = normalizeStock(productData.stock);
          
          console.log(`📦 [后端] 创建商品 "${productData.name}":`, {
            images: images,
            imagesInput: productData.images,
            imagesInputType: typeof productData.images,
            imagesInputJSON: JSON.stringify(productData.images),
            imagesCount: images.length,
            stock: stock,
            stockInput: productData.stock,
            stockInputType: typeof productData.stock,
            hasVariants: productData.hasVariants,
            fullProductData: JSON.stringify(productData, null, 2), // 完整商品数据用于调试
          });
          
          // 如果图片数组为空，发出警告
          if (images.length === 0 && productData.images) {
            console.warn(`⚠️ [后端] 商品 "${productData.name}" 的图片URL处理结果为空，原始值:`, productData.images, '类型:', typeof productData.images);
          }

          const product = await prisma.product.create({
            data: {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              categoryId: categoryId,
              images: images,
              stock: stock,
              specifications: productData.specifications || {},
              isActive: productData.isActive !== undefined ? productData.isActive : true,
              hasVariants: productData.hasVariants ?? false,
              basePrice: productData.basePrice || productData.price,
              minPrice: productData.minPrice,
              maxPrice: productData.maxPrice,
            },
            include: {
              category: true,
            },
          });
          
          // 验证创建后的商品数据
          const createdProduct = await prisma.product.findUnique({
            where: { id: product.id },
            select: { id: true, name: true, stock: true, hasVariants: true },
          });
          
          console.log(`✅ [后端] 商品创建成功 "${product.name}":`, {
            id: product.id,
            images: product.images,
            stock: product.stock,
            stockType: typeof product.stock,
            hasVariants: product.hasVariants,
            verifiedStock: createdProduct?.stock, // 从数据库重新查询验证
            stockMatch: product.stock === createdProduct?.stock,
            stockInput: productData.stock, // 原始输入值
            normalizedStock: stock, // 处理后的库存值
          });

          results.success.push(product);
        } catch (error: any) {
          console.error(`Failed to create product at index ${i + 1}:`, error);
          
          // 处理 Prisma 唯一约束错误
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              // 唯一约束违反（通常是商品名称）
              const field = (error.meta as any)?.target?.[0] || 'field';
              // 确保错误信息是中文，不使用国际化key
              const errorMessage = `商品名称 "${productData.name}" 已存在，请修改商品名称`;
              results.failed.push({
                index: i + 1,
                data: productData,
                error: errorMessage,
              });
              continue;
            }
          }
          
          results.failed.push({
            index: i + 1,
            data: productData,
            error: error?.message || req.t('common:errors.internalServerError'),
          });
        }
      }

      // 清除相关缓存
      if (results.success.length > 0) {
        CacheService.delete(CACHE_KEYS.CATEGORIES);
        CacheService.deleteByPrefix(CACHE_KEYS.PRODUCTS);
      }

      res.status(200).json({
        success: true,
        message: req.t('products:success.bulkCreated', { 
          success: results.success.length, 
          total: productsData.length 
        }),
        data: {
          success: results.success,
          failed: results.failed,
          summary: {
            total: productsData.length,
            success: results.success.length,
            failed: results.failed.length,
          },
        },
      });
      return;
    } catch (error: any) {
      console.error('Bulk create products error:', error);
      const appError = handlePrismaError(error);
      sendErrorResponse(res, appError);
      return;
    }
  }

  // 更新商品（管理員）
  static async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const productData = req.body;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: req.t('products:errors.notFound'),
        });
        return;
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: productData,
        include: {
          category: true,
        },
      });

      res.json({
        success: true,
        message: req.t('products:success.updated'),
        data: updatedProduct,
      });
      return;
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: req.t('common:errors.internalServerError'),
      });
      return;
    }
  }

  // 刪除商品（管理員）
  static async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: req.t('products:errors.notFound'),
        });
        return;
      }

      // 軟刪除：設定 isActive 為 false
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      // 清除相关缓存
      CacheService.delete(`${CACHE_KEYS.PRODUCT}:${id}`);
      CacheService.delete(CACHE_KEYS.CATEGORIES);
      CacheService.deleteByPrefix(CACHE_KEYS.PRODUCTS);

      res.json({
        success: true,
        message: req.t('products:success.deleted'),
      });
      return;
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: req.t('common:errors.internalServerError'),
      });
      return;
    }
  }

  // 獲取已刪除的商品列表（垃圾桶）
  static async getDeletedProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {
        isActive: false, // 只获取已软删除的商品
      };

      // 搜索
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { updatedAt: 'desc' }, // 按删除时间倒序
          include: {
            category: true,
            variants: {
              where: { isActive: true },
              take: 1, // 只获取一个变体用于显示
            },
          },
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
      return;
    } catch (error: any) {
      console.error('Get deleted products error:', error);
      const appError = handlePrismaError(error);
      sendErrorResponse(res, appError);
      return;
    }
  }

  // 恢復商品（從垃圾桶恢復）
  static async restoreProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: req.t('products:errors.notFound'),
        });
        return;
      }

      if (product.isActive) {
        res.status(400).json({
          success: false,
          message: '商品已经是活跃状态，无需恢复',
        });
        return;
      }

      // 恢復商品：設定 isActive 為 true
      const restoredProduct = await prisma.product.update({
        where: { id },
        data: { isActive: true },
        include: {
          category: true,
        },
      });

      // 清除相关缓存
      CacheService.delete(`${CACHE_KEYS.PRODUCT}:${id}`);
      CacheService.delete(CACHE_KEYS.CATEGORIES);
      CacheService.deleteByPrefix(CACHE_KEYS.PRODUCTS);

      console.log(`✅ [恢复商品] 商品 "${restoredProduct.name}" 已恢复`);

      res.json({
        success: true,
        message: '商品已恢复',
        data: restoredProduct,
      });
      return;
    } catch (error: any) {
      console.error('Restore product error:', error);
      const appError = handlePrismaError(error);
      sendErrorResponse(res, appError);
      return;
    }
  }

  // 永久刪除商品（從數據庫中真正刪除）
  static async permanentlyDeleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          variants: true,
          reviews: true,
          orderItems: true,
        },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: req.t('products:errors.notFound'),
        });
        return;
      }

      // 检查是否有订单关联（如果有订单，可能需要保留记录）
      const hasOrders = product.orderItems.length > 0;
      if (hasOrders) {
        res.status(400).json({
          success: false,
          message: `无法永久删除：该商品有 ${product.orderItems.length} 个订单关联，请先处理订单`,
        });
        return;
      }

      // 使用事务删除商品及其关联数据
      await prisma.$transaction(async (tx) => {
        // 删除变体（级联删除会自动删除变体属性关联）
        if (product.variants.length > 0) {
          await tx.productVariant.deleteMany({
            where: { productId: id },
          });
        }

        // 删除评论
        if (product.reviews.length > 0) {
          await tx.review.deleteMany({
            where: { productId: id },
          });
        }

        // 删除购物车项
        await tx.cartItem.deleteMany({
          where: { productId: id },
        });

        // 最后删除商品本身
        await tx.product.delete({
          where: { id },
        });
      });

      // 清除相关缓存
      CacheService.delete(`${CACHE_KEYS.PRODUCT}:${id}`);
      CacheService.delete(CACHE_KEYS.CATEGORIES);
      CacheService.deleteByPrefix(CACHE_KEYS.PRODUCTS);

      console.log(`🗑️ [永久删除] 商品 "${product.name}" 已从数据库中永久删除`);

      res.json({
        success: true,
        message: '商品已永久删除',
      });
      return;
    } catch (error: any) {
      console.error('Permanently delete product error:', error);
      const appError = handlePrismaError(error);
      sendErrorResponse(res, appError);
      return;
    }
  }
}


