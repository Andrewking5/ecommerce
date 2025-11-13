import Stripe from 'stripe';
import { prisma } from '../app';
import { Decimal } from '@prisma/client/runtime/library';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class PaymentService {
  /**
   * 创建支付意图
   */
  static async createPaymentIntent(
    orderId: string,
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // 转换为分
        currency,
        metadata: {
          orderId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // 保存支付记录到数据库
      await prisma.payment.create({
        data: {
          orderId,
          amount: new Decimal(amount),
          currency,
          status: 'PENDING',
          paymentMethod: 'stripe',
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      // 更新订单的paymentIntentId
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentIntentId: paymentIntent.id },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * 处理Stripe Webhook
   */
  static async handleWebhook(
    event: Stripe.Event
  ): Promise<{ success: boolean; message: string }> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleRefund(event.data.object as Stripe.Charge);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * 处理支付成功
   */
  private static async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      throw new Error('Order ID not found in payment intent metadata');
    }

    // 更新支付记录
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'SUCCEEDED',
        stripeChargeId: paymentIntent.latest_charge as string,
      },
    });

    // 更新订单状态
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
      },
    });
  }

  /**
   * 处理支付失败
   */
  private static async handlePaymentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      throw new Error('Order ID not found in payment intent metadata');
    }

    // 更新支付记录
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'FAILED',
      },
    });

    // 订单保持PENDING状态，等待用户重试
  }

  /**
   * 处理退款
   */
  private static async handleRefund(charge: Stripe.Charge): Promise<void> {
    // 查找对应的支付记录
    const payment = await prisma.payment.findFirst({
      where: { stripeChargeId: charge.id },
      include: { order: true },
    });

    if (!payment) {
      console.warn(`Payment not found for charge: ${charge.id}`);
      return;
    }

    const refundAmount = charge.amount_refunded / 100; // 转换为元

    // 更新支付记录
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: refundAmount >= Number(payment.amount) ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundAmount: new Decimal(refundAmount),
        refundReason: charge.refunds?.data[0]?.reason || 'Customer request',
      },
    });

    // 更新订单状态
    if (refundAmount >= Number(payment.amount)) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'REFUNDED' },
      });
    }
  }

  /**
   * 创建退款
   */
  static async createRefund(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (!payment.stripeChargeId) {
        throw new Error('Stripe charge ID not found');
      }

      const refundParams: Stripe.RefundCreateParams = {
        charge: payment.stripeChargeId,
        reason: reason ? (reason as Stripe.RefundCreateParams.Reason) : undefined,
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // 转换为分
      }

      const refund = await stripe.refunds.create(refundParams);

      // 更新支付记录
      const refundAmount = refund.amount / 100;
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: refundAmount >= Number(payment.amount) ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          refundAmount: new Decimal(refundAmount),
          refundReason: reason || 'Customer request',
        },
      });

      // 更新订单状态
      if (refundAmount >= Number(payment.amount)) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'REFUNDED' },
        });
      }

      return refund;
    } catch (error) {
      console.error('Create refund error:', error);
      throw new Error('Failed to create refund');
    }
  }

  /**
   * 获取支付状态
   */
  static async getPaymentStatus(orderId: string) {
    const payment = await prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    return payment;
  }

  /**
   * 验证Webhook签名
   */
  static verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }
}

