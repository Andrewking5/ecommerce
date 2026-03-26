import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { CouponController } from '../controllers/couponController';

const router = Router();

// 管理员路由（必须在 /:code 之前，否则 "admin" 会被当作 code）
router.get('/admin/coupons', authenticateToken, requireAdmin, CouponController.getAllCoupons);
router.post('/admin/coupons', authenticateToken, requireAdmin, CouponController.createCoupon);
router.post('/admin/coupons/bulk-action', authenticateToken, requireAdmin, CouponController.bulkAction);
router.get('/admin/coupons/:id', authenticateToken, requireAdmin, CouponController.getCouponById);
router.put('/admin/coupons/:id', authenticateToken, requireAdmin, CouponController.updateCoupon);
router.delete('/admin/coupons/:id', authenticateToken, requireAdmin, CouponController.deleteCoupon);
router.get('/admin/coupons/:id/usage', authenticateToken, requireAdmin, CouponController.getCouponUsage);
router.get('/admin/coupons/:id/stats', authenticateToken, requireAdmin, CouponController.getCouponStats);

// 公开路由：验证优惠券（放在最后，避免拦截 admin 路由）
router.get('/:code', CouponController.validateCoupon);

export default router;

