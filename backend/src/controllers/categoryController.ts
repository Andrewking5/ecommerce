import { Request, Response } from 'express';
import { prisma } from '../app';

export class CategoryController {
  // 獲取分類列表（管理員）
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const { includeInactive } = req.query;
      
      const where: any = {};
      if (includeInactive !== 'true') {
        where.isActive = true;
      }

      const categories = await prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: categories.map((cat) => ({
          ...cat,
          productCount: cat._count.products,
        })),
      });
      return;
    } catch (error: any) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Internal server error',
      });
      return;
    }
  }

  // 獲取單一分類
  static async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          ...category,
          productCount: category._count.products,
        },
      });
      return;
    } catch (error: any) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Internal server error',
      });
      return;
    }
  }

  // 創建分類（管理員）
  static async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, slug, description, image, isActive = true } = req.body;

      // 驗證必填字段
      if (!name || !slug) {
        res.status(400).json({
          success: false,
          message: 'Name and slug are required',
        });
        return;
      }

      // 檢查 slug 是否已存在
      const existingCategory = await prisma.category.findUnique({
        where: { slug },
      });

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: 'Category with this slug already exists',
        });
        return;
      }

      // 檢查 name 是否已存在
      const existingName = await prisma.category.findUnique({
        where: { name },
      });

      if (existingName) {
        res.status(400).json({
          success: false,
          message: 'Category with this name already exists',
        });
        return;
      }

      const category = await prisma.category.create({
        data: {
          name,
          slug,
          description,
          image,
          isActive,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
      return;
    } catch (error: any) {
      console.error('Create category error:', error);
      
      if (error?.code === 'P2002') {
        res.status(400).json({
          success: false,
          message: 'Category with this name or slug already exists',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error?.message || 'Internal server error',
      });
      return;
    }
  }

  // 更新分類（管理員）
  static async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, slug, description, image, isActive } = req.body;

      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }

      // 如果更新 slug，檢查是否與其他分類衝突
      if (slug && slug !== category.slug) {
        const existingSlug = await prisma.category.findUnique({
          where: { slug },
        });

        if (existingSlug) {
          res.status(400).json({
            success: false,
            message: 'Category with this slug already exists',
          });
          return;
        }
      }

      // 如果更新 name，檢查是否與其他分類衝突
      if (name && name !== category.name) {
        const existingName = await prisma.category.findUnique({
          where: { name },
        });

        if (existingName) {
          res.status(400).json({
            success: false,
            message: 'Category with this name already exists',
          });
          return;
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image = image;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory,
      });
      return;
    } catch (error: any) {
      console.error('Update category error:', error);
      
      if (error?.code === 'P2002') {
        res.status(400).json({
          success: false,
          message: 'Category with this name or slug already exists',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error?.message || 'Internal server error',
      });
      return;
    }
  }

  // 刪除分類（管理員）
  static async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }

      // 檢查是否有商品使用此分類
      if (category._count.products > 0) {
        res.status(400).json({
          success: false,
          message: `Cannot delete category. ${category._count.products} product(s) are using this category. Please reassign or delete those products first.`,
        });
        return;
      }

      await prisma.category.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
      return;
    } catch (error: any) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Internal server error',
      });
      return;
    }
  }
}

