import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ReviewController } from '../controllers/reviewController';

const router = Router();

// 用户路由（需要认证）
router.post('/', authenticateToken, ReviewController.createReview);
router.get('/product/:productId', ReviewController.getProductReviews); // 公开路由
router.put('/:id', authenticateToken, ReviewController.updateReview);
router.delete('/:id', authenticateToken, ReviewController.deleteReview);
router.post('/:id/helpful', ReviewController.markHelpful); // 公开路由

// 管理员路由
router.get('/admin/reviews', authenticateToken, requireAdmin, ReviewController.getAllReviews);
router.get('/admin/reviews/:id', authenticateToken, requireAdmin, ReviewController.getReviewById);
router.put('/admin/reviews/:id/approve', authenticateToken, requireAdmin, ReviewController.approveReview);
router.put('/admin/reviews/:id/reject', authenticateToken, requireAdmin, ReviewController.rejectReview);
router.post('/admin/reviews/bulk-approve', authenticateToken, requireAdmin, ReviewController.bulkApprove);
router.get('/admin/reviews/stats', authenticateToken, requireAdmin, ReviewController.getReviewStats);

export default router;

