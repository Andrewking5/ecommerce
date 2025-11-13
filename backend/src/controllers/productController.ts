import { Request, Response } from 'express';
import { prisma } from '../app';
import { ProductWithRelations, ReviewWithRating } from '../types/prisma';

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
          },
        }),
        prisma.product.count({ where }),
      ]);

      // 計算平均評分
      const productsWithRating = products.map((product: ProductWithRelations) => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum: number, review: ReviewWithRating) => sum + review.rating, 0) / product.reviews.length
          : 0,
        reviewCount: product.reviews.length,
      }));

      res.json({
        success: true,
        data: {
          products: productsWithRating,
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
      console.error('❌ Get products error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
        stack: error?.stack?.split('\n').slice(0, 5).join('\n'), // 只顯示前5行堆棧
      });
      
      // 如果是 Prisma 錯誤，提供更詳細的信息
      if (error?.code === 'P2002') {
        res.status(400).json({
          success: false,
          message: req.t('products:errors.uniqueConstraintViolation'),
          details: error?.meta,
        });
        return;
      }
      
      if (error?.code === 'P2025') {
        res.status(404).json({
          success: false,
          message: req.t('products:errors.recordNotFound'),
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error?.message || req.t('common:errors.internalServerError'),
        ...(process.env.NODE_ENV !== 'production' && { 
          error: error?.stack,
          code: error?.code,
          meta: error?.meta,
        }),
      });
      return;
    }
  }

  // 獲取單一商品
  static async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id, isActive: true },
        include: {
          category: true,
          reviews: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
      return;
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: req.t('common:errors.internalServerError'),
      });
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

      // 處理分類：優先使用 categoryId，如果沒有則使用 category slug
      let categoryId: string;
      
      if (productData.categoryId) {
        // 前端直接提供 categoryId（推薦方式）
        categoryId = productData.categoryId;
        
        // 驗證分類是否存在
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (!category) {
          res.status(400).json({
            success: false,
            message: req.t('categories:errors.notFound'),
          });
          return;
        }
      } else if (productData.category) {
        // 兼容舊方式：使用 category slug
        const category = await prisma.category.findUnique({
          where: { slug: productData.category },
        });

        if (!category) {
          res.status(400).json({
            success: false,
            message: req.t('categories:errors.notFound'),
          });
          return;
        }
        
        categoryId = category.id;
      } else {
        res.status(400).json({
          success: false,
          message: req.t('products:errors.categoryRequired'),
        });
        return;
      }

      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          categoryId: categoryId,
          images: productData.images || [],
          stock: productData.stock || 0,
          specifications: productData.specifications || {},
          isActive: productData.isActive !== undefined ? productData.isActive : true,
        },
        include: {
          category: true,
        },
      });

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
      res.status(500).json({
        success: false,
        message: error?.message || req.t('common:errors.internalServerError'),
      });
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
}


