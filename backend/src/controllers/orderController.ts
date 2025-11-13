import { Request, Response } from 'express';
import { prisma } from '../app';
import { ProductBasic } from '../types/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { EmailService } from '../services/emailService';

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
      const {
        items,
        shippingAddress,
        billingAddress,
        paymentMethod,
        couponCode,
        shippingCost,
        addressId, // 地址ID，如果提供则使用保存的地址
      } = req.body;

      // 如果提供了addressId，从地址簿获取地址
      let finalShippingAddress = shippingAddress;
      if (addressId) {
        const savedAddress = await prisma.userAddress.findFirst({
          where: {
            id: addressId,
            userId, // 确保地址属于当前用户
          },
        });

        if (!savedAddress) {
          res.status(404).json({
            success: false,
            message: 'Address not found',
          });
          return;
        }

        // 转换为订单地址格式
        finalShippingAddress = {
          street: `${savedAddress.province}${savedAddress.city}${savedAddress.district}${savedAddress.street}`,
          city: savedAddress.city,
          state: savedAddress.province,
          zipCode: savedAddress.zipCode || '',
          country: '中国',
        };
      }

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

      // 計算商品總金額
      const subtotal = items.reduce((sum: number, item: any) => {
        const product = products.find((p: ProductBasic) => p.id === item.productId);
        return sum + Number(product!.price) * item.quantity;
      }, 0);

      // 驗證並計算優惠券折扣
      let discountAmount = 0;
      let validatedCouponCode = null;

      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode },
        });

        if (!coupon) {
          res.status(400).json({
            success: false,
            message: 'Invalid coupon code',
          });
          return;
        }

        // 驗證優惠券
        const now = new Date();
        if (!coupon.isActive) {
          res.status(400).json({
            success: false,
            message: 'Coupon is not active',
          });
          return;
        }

        if (now < coupon.validFrom || now > coupon.validUntil) {
          res.status(400).json({
            success: false,
            message: 'Coupon is not valid at this time',
          });
          return;
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          res.status(400).json({
            success: false,
            message: 'Coupon usage limit reached',
          });
          return;
        }

        if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
          res.status(400).json({
            success: false,
            message: `Minimum purchase amount of $${coupon.minPurchase} required`,
          });
          return;
        }

        // 計算折扣
        if (coupon.type === 'PERCENTAGE') {
          discountAmount = (subtotal * Number(coupon.value)) / 100;
          if (coupon.maxDiscount) {
            discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
          }
        } else {
          discountAmount = Number(coupon.value);
        }

        discountAmount = Math.min(discountAmount, subtotal); // 折扣不能超过商品总额
        validatedCouponCode = couponCode;
      }

      // 計算運費（如果未提供，使用默認值或免費）
      const calculatedShippingCost = shippingCost !== undefined
        ? Number(shippingCost)
        : subtotal >= 100 ? 0 : 10; // 滿100免運費

      // 計算稅費（假設稅率為8%）
      const taxRate = 0.08;
      const taxAmount = (subtotal - discountAmount + calculatedShippingCost) * taxRate;

      // 計算總金額
      const totalAmount = subtotal - discountAmount + calculatedShippingCost + taxAmount;

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
          shippingAddress: finalShippingAddress,
          billingAddress: billingAddress || finalShippingAddress,
          totalAmount: new Decimal(totalAmount),
          shippingCost: new Decimal(calculatedShippingCost),
          taxAmount: new Decimal(taxAmount),
          discountAmount: discountAmount > 0 ? new Decimal(discountAmount) : null,
          couponCode: validatedCouponCode,
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

      // 更新優惠券使用次數
      if (validatedCouponCode) {
        await prisma.coupon.update({
          where: { code: validatedCouponCode },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

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

      // 发送订单确认邮件
      try {
        if (order.user && order.orderItems) {
          await EmailService.sendOrderConfirmation(order.user.email, {
            orderId: order.id,
            orderNumber: order.id.substring(0, 8).toUpperCase(),
            totalAmount: Number(order.totalAmount),
            items: order.orderItems.map((item: any) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: Number(item.price),
            })),
            shippingAddress: order.shippingAddress,
          });
        }
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // 不阻止订单创建，只记录错误
      }

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
      const {
        page = 1,
        limit = 20,
        status,
        search,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        userId,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      
      // 状态筛选
      if (status) {
        where.status = status;
      }

      // 搜索（订单号、客户邮箱、商品名称）
      if (search) {
        where.OR = [
          { id: { contains: search as string, mode: 'insensitive' } },
          { user: { email: { contains: search as string, mode: 'insensitive' } } },
          {
            orderItems: {
              some: {
                product: {
                  name: { contains: search as string, mode: 'insensitive' },
                },
              },
            },
          },
        ];
      }

      // 用户筛选
      if (userId) {
        where.userId = userId as string;
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

      // 金额范围筛选
      if (minAmount || maxAmount) {
        where.totalAmount = {};
        if (minAmount) {
          where.totalAmount.gte = Number(minAmount);
        }
        if (maxAmount) {
          where.totalAmount.lte = Number(maxAmount);
        }
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

      // 发送订单状态更新邮件
      try {
        if (order.user) {
          await EmailService.sendOrderStatusUpdate(order.user.email, {
            orderId: order.id,
            orderNumber: order.id.substring(0, 8).toUpperCase(),
            status: order.status,
          });
        }
      } catch (emailError) {
        console.error('Failed to send order status update email:', emailError);
        // 不阻止状态更新，只记录错误
      }

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


