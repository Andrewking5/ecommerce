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
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minPrice,
        maxPrice,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // 建構查詢條件
      const where: any = {
        isActive: true,
      };

      if (category) {
        where.category = { slug: category };
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
      }

      // 執行查詢
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder },
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
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
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
        message: 'Internal server error',
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
          message: 'Search query is required',
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
        message: 'Internal server error',
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
        message: 'Internal server error',
      });
      return;
    }
  }

  // 創建商品（管理員）
  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = req.body;
      const userId = (req as any).user.id;

      // 查找分類
      const category = await prisma.category.findUnique({
        where: { slug: productData.category },
      });

      if (!category) {
        res.status(400).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }

      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          categoryId: category.id,
          images: productData.images,
          stock: productData.stock,
          specifications: productData.specifications,
        },
        include: {
          category: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
      return;
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
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
          message: 'Product not found',
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
        message: 'Product updated successfully',
        data: updatedProduct,
      });
      return;
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
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
          message: 'Product not found',
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
        message: 'Product deleted successfully',
      });
      return;
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }
}


