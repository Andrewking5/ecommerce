import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { InventoryController } from '../controllers/inventoryController';

const router = Router();

// 所有库存管理路由都需要管理员权限
router.use(authenticateToken, requireAdmin);

router.get('/low-stock', InventoryController.getLowStockProducts);
router.get('/stats', InventoryController.getInventoryStats);
router.post('/bulk-update', InventoryController.bulkUpdateStock);
router.put('/:id/adjust', InventoryController.quickAdjustStock);

export default router;

