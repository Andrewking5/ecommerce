import { Request, Response } from 'express';
import { prisma } from '../app';

export class WishlistController {
  /**
   * 取得使用者的願望清單
   * GET /api/wishlist
   */
  static async getWishlist(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const items = await prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true,
              isActive: true,
              category: {
                select: { name: true, slug: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Get wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wishlist',
      });
    }
  }

  /**
   * 切換願望清單項目（新增或移除）
   * POST /api/wishlist/toggle
   */
  static async toggleWishlistItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { productId } = req.body;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: 'productId is required',
        });
        return;
      }

      // 檢查商品是否存在
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      // 檢查是否已在願望清單中
      const existing = await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: { userId, productId },
        },
      });

      if (existing) {
        // 已存在 → 移除
        await prisma.wishlistItem.delete({
          where: { id: existing.id },
        });

        res.json({ success: true, action: 'removed' });
      } else {
        // 不存在 → 新增
        const item = await prisma.wishlistItem.create({
          data: { userId, productId },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        });

        res.json({ success: true, action: 'added', data: item });
      }
    } catch (error) {
      console.error('Toggle wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle wishlist item',
      });
    }
  }

  /**
   * 從願望清單移除商品
   * DELETE /api/wishlist/:productId
   */
  static async removeWishlistItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { productId } = req.params;

      await prisma.wishlistItem.deleteMany({
        where: { userId, productId },
      });

      res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
      console.error('Remove wishlist item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove wishlist item',
      });
    }
  }

  /**
   * 檢查商品是否在願望清單中
   * GET /api/wishlist/check/:productId
   */
  static async checkWishlistItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { productId } = req.params;

      const item = await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: { userId, productId },
        },
      });

      res.json({ success: true, inWishlist: !!item });
    } catch (error) {
      console.error('Check wishlist item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check wishlist item',
      });
    }
  }
}
