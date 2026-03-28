import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { WishlistController } from '../controllers/wishlistController';

const router = Router();

// 所有路由都需要認證
router.use(authenticateToken);

// 取得願望清單
router.get('/', WishlistController.getWishlist);

// 切換願望清單（新增/移除）
router.post('/toggle', WishlistController.toggleWishlistItem);

// 檢查商品是否在願望清單中
router.get('/check/:productId', WishlistController.checkWishlistItem);

// 從願望清單移除
router.delete('/:productId', WishlistController.removeWishlistItem);

export default router;
