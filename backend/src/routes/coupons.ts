import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { CouponController } from '../controllers/couponController';

const router = Router();

// 公开路由：验证优惠券（不需要认证）
router.get('/:code', CouponController.validateCoupon);

// 管理员路由
router.get('/admin/coupons', authenticateToken, requireAdmin, CouponController.getAllCoupons);
router.get('/admin/coupons/:id', authenticateToken, requireAdmin, CouponController.getCouponById);
router.post('/admin/coupons', authenticateToken, requireAdmin, CouponController.createCoupon);
router.put('/admin/coupons/:id', authenticateToken, requireAdmin, CouponController.updateCoupon);
router.delete('/admin/coupons/:id', authenticateToken, requireAdmin, CouponController.deleteCoupon);
router.get('/admin/coupons/:id/usage', authenticateToken, requireAdmin, CouponController.getCouponUsage);
router.get('/admin/coupons/:id/stats', authenticateToken, requireAdmin, CouponController.getCouponStats);
router.post('/admin/coupons/bulk-action', authenticateToken, requireAdmin, CouponController.bulkAction);

export default router;

