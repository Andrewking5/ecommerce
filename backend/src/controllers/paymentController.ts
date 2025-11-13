import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { prisma } from '../app';

export class PaymentController {
  /**
   * 创建支付意图
   * POST /api/payments/create-intent
   */
  static async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { orderId, amount, currency = 'usd' } = req.body;

      if (!orderId || !amount) {
        res.status(400).json({
          success: false,
          message: 'Order ID and amount are required',
        });
        return;
      }

      // 验证订单属于当前用户
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
          status: 'PENDING',
        },
      });

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found or not available for payment',
        });
        return;
      }

      // 创建支付意图
      const paymentIntent = await PaymentService.createPaymentIntent(
        orderId,
        amount,
        currency,
        {
          userId,
        }
      );

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      });
      return;
    } catch (error) {
      console.error('Create payment intent error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent',
      });
      return;
    }
  }

  /**
   * 处理Stripe Webhook
   * POST /api/payments/webhook
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        res.status(400).json({
          success: false,
          message: 'Missing stripe-signature header',
        });
        return;
      }

      // 验证Webhook签名
      const event = PaymentService.verifyWebhookSignature(
        req.body,
        signature
      );

      // 处理Webhook事件
      await PaymentService.handleWebhook(event);

      res.json({ received: true });
      return;
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({
        success: false,
        message: 'Webhook processing failed',
      });
      return;
    }
  }

  /**
   * 获取支付状态
   * GET /api/payments/:orderId
   */
  static async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { orderId } = req.params;

      // 验证订单属于当前用户
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
      });

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      const payment = await PaymentService.getPaymentStatus(orderId);

      res.json({
        success: true,
        data: payment,
      });
      return;
    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment status',
      });
      return;
    }
  }

  /**
   * 获取所有支付记录（管理员）
   * GET /api/admin/payments
   */
  static async getAllPayments(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        orderId,
        startDate,
        endDate,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (orderId) {
        where.orderId = orderId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string);
        }
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            order: {
              select: {
                id: true,
                status: true,
                totalAmount: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        }),
        prisma.payment.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          payments,
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
      console.error('Get all payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payments',
      });
      return;
    }
  }

  /**
   * 获取支付详情（管理员）
   * GET /api/admin/payments/:id
   */
  static async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          order: {
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
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
        return;
      }

      res.json({
        success: true,
        data: payment,
      });
      return;
    } catch (error) {
      console.error('Get payment by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment',
      });
      return;
    }
  }

  /**
   * 处理退款（管理员）
   * POST /api/admin/payments/:id/refund
   */
  static async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;

      const refund = await PaymentService.createRefund(id, amount, reason);

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        },
      });
      return;
    } catch (error: any) {
      console.error('Process refund error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process refund',
      });
      return;
    }
  }

  /**
   * 获取支付统计（管理员）
   * GET /api/admin/payments/stats
   */
  static async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string);
        }
      }

      const [
        totalPayments,
        succeededPayments,
        failedPayments,
        totalAmount,
        refundedAmount,
      ] = await Promise.all([
        prisma.payment.count({ where }),
        prisma.payment.count({
          where: { ...where, status: 'SUCCEEDED' },
        }),
        prisma.payment.count({
          where: { ...where, status: 'FAILED' },
        }),
        prisma.payment.aggregate({
          where: { ...where, status: 'SUCCEEDED' },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { ...where, status: { in: ['REFUNDED', 'PARTIALLY_REFUNDED'] } },
          _sum: { refundAmount: true },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalPayments,
          succeededPayments,
          failedPayments,
          totalAmount: totalAmount._sum.amount || 0,
          refundedAmount: refundedAmount._sum.refundAmount || 0,
          successRate:
            totalPayments > 0
              ? ((succeededPayments / totalPayments) * 100).toFixed(2)
              : '0.00',
        },
      });
      return;
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment stats',
      });
      return;
    }
  }
}

