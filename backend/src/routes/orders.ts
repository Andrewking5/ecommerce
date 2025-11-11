import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { OrderController } from '../controllers/orderController';

const router = Router();

// 所有訂單路由都需要認證
router.use(authenticateToken);

// 用戶訂單路由
router.get('/', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);

// 管理員路由
router.get('/admin/all', requireAdmin, OrderController.getAllOrders);
router.put('/:id/status', requireAdmin, OrderController.updateOrderStatus);

export default router;


