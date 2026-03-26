import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ReviewController } from '../controllers/reviewController';

const router = Router();

// 公开路由
router.get('/product/:productId', ReviewController.getProductReviews);

// 管理员路由（必须在 /:id 之前，否则 "admin" 会被当作 id）
router.get('/admin/reviews', authenticateToken, requireAdmin, ReviewController.getAllReviews);
router.get('/admin/reviews/stats', authenticateToken, requireAdmin, ReviewController.getReviewStats);
router.post('/admin/reviews/bulk-approve', authenticateToken, requireAdmin, ReviewController.bulkApprove);
router.get('/admin/reviews/:id', authenticateToken, requireAdmin, ReviewController.getReviewById);
router.put('/admin/reviews/:id/approve', authenticateToken, requireAdmin, ReviewController.approveReview);
router.put('/admin/reviews/:id/reject', authenticateToken, requireAdmin, ReviewController.rejectReview);

// 用户路由（需要认证）
router.post('/', authenticateToken, ReviewController.createReview);
router.put('/:id', authenticateToken, ReviewController.updateReview);
router.delete('/:id', authenticateToken, ReviewController.deleteReview);
router.post('/:id/helpful', ReviewController.markHelpful);

export default router;

