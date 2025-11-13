import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { PaymentController } from '../controllers/paymentController';
import express from 'express';

const router = Router();

// Webhook路由不需要认证（Stripe直接调用）
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

// 所有其他支付路由需要认证
router.use(authenticateToken);

// 用户支付路由
router.post('/create-intent', PaymentController.createPaymentIntent);
router.get('/:orderId', PaymentController.getPaymentStatus);

// 管理员路由
router.get('/admin/payments', requireAdmin, PaymentController.getAllPayments);
router.get('/admin/payments/:id', requireAdmin, PaymentController.getPaymentById);
router.post('/admin/payments/:id/refund', requireAdmin, PaymentController.processRefund);
router.get('/admin/payments/stats', requireAdmin, PaymentController.getPaymentStats);

export default router;

