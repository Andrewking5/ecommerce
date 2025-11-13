import { Request, Response } from 'express';
import { prisma } from '../app';

export class InventoryController {
  // 获取库存预警列表
  static async getLowStockProducts(req: Request, res: Response): Promise<void> {
    try {
      const { threshold = 10, page = 1, limit = 20 } = req.query;
      const thresholdNum = Number(threshold);
      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        stock: {
          lte: thresholdNum,
          gt: 0, // 排除完全无库存的
        },
        isActive: true,
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { stock: 'asc' },
          include: {
            category: true,
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
          threshold: thresholdNum,
        },
      });
    } catch (error: any) {
      console.error('Get low stock products error:', error);
      const errorMessage = error?.message || 'Internal server error';
      const errorCode = error?.code || 'INTERNAL_ERROR';
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        code: errorCode,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error?.stack,
        }),
      });
    }
  }

  // 批量更新库存
  static async bulkUpdateStock(req: Request, res: Response): Promise<void> {
    try {
      const { updates } = req.body; // [{ productId, stock }]

      if (!Array.isArray(updates) || updates.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Updates array is required',
        });
        return;
      }

      const results = await Promise.all(
        updates.map(async ({ productId, stock }: { productId: string; stock: number }) => {
          if (stock < 0) {
            throw new Error(`Stock cannot be negative for product ${productId}`);
          }

          const product = await prisma.product.update({
            where: { id: productId },
            data: { stock: Number(stock) },
            select: { id: true, name: true, stock: true },
          });

          return product;
        })
      );

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: results,
      });
    } catch (error: any) {
      console.error('Bulk update stock error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  // 快速调整单个商品库存
  static async quickAdjustStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { adjustment, newStock } = req.body; // adjustment: 增减数量, newStock: 新库存值

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

      let newStockValue: number;
      if (newStock !== undefined) {
        newStockValue = Number(newStock);
      } else if (adjustment !== undefined) {
        newStockValue = product.stock + Number(adjustment);
      } else {
        res.status(400).json({
          success: false,
          message: 'Either adjustment or newStock is required',
        });
        return;
      }

      if (newStockValue < 0) {
        res.status(400).json({
          success: false,
          message: 'Stock cannot be negative',
        });
        return;
      }

      const updated = await prisma.product.update({
        where: { id },
        data: { stock: newStockValue },
        include: {
          category: true,
        },
      });

      res.json({
        success: true,
        message: 'Stock adjusted successfully',
        data: updated,
      });
    } catch (error: any) {
      console.error('Quick adjust stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // 获取库存统计
  static async getInventoryStats(req: Request, res: Response): Promise<void> {
    try {
      const { threshold = 10 } = req.query;
      const thresholdNum = Number(threshold);

      const [
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        lowStockProducts,
        totalStockValue,
      ] = await Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({
          where: { stock: { gt: 0 }, isActive: true },
        }),
        prisma.product.count({
          where: { stock: { lte: 0 }, isActive: true },
        }),
        prisma.product.count({
          where: {
            stock: { lte: thresholdNum, gt: 0 },
            isActive: true,
          },
        }),
        prisma.product.aggregate({
          where: { isActive: true },
          _sum: {
            stock: true,
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalProducts,
          inStockProducts,
          outOfStockProducts,
          lowStockProducts,
          totalStockValue: totalStockValue._sum.stock || 0,
          threshold: thresholdNum,
        },
      });
    } catch (error: any) {
      console.error('Get inventory stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

