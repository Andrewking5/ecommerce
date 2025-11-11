import { Request, Response } from 'express';
import { prisma } from '../app';
import { ProductBasic } from '../types/prisma';

export class OrderController {
  // 獲取用戶訂單
  static async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        }),
        prisma.order.count({ where: { userId } }),
      ]);

      res.json({
        success: true,
        data: {
          orders,
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
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 獲取單一訂單
  static async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const order = await prisma.order.findFirst({
        where: { id, userId },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
      return;
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 創建訂單
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

      // 驗證商品庫存
      const productIds = items.map((item: any) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      // 檢查庫存
      for (const item of items) {
        const product = products.find((p: ProductBasic) => p.id === item.productId);
        if (!product) {
          res.status(400).json({
            success: false,
            message: `Product ${item.productId} not found`,
          });
          return;
        }
        if (product.stock < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.name}`,
          });
          return;
        }
      }

      // 計算總金額
      const totalAmount = items.reduce((sum: number, item: any) => {
        const product = products.find((p: ProductBasic) => p.id === item.productId);
        return sum + (Number(product!.price) * item.quantity);
      }, 0);

      // 創建訂單
      const order = await prisma.order.create({
        data: {
          userId,
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: products.find((p: ProductBasic) => p.id === item.productId)!.price,
            })),
          },
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          totalAmount,
          status: 'PENDING',
          paymentMethod,
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // 更新商品庫存
      await Promise.all(
        items.map((item: any) =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        )
      );

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
      return;
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 獲取所有訂單（管理員）
  static async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, status } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        prisma.order.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          orders,
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
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  // 更新訂單狀態（管理員）
  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
      return;
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }
}


