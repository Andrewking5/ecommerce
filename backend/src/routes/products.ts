import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ProductController } from '../controllers/productController';

const router = Router();

// 公開路由
router.get('/', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/categories', ProductController.getCategories);

// 需要認證的管理員路由（必須在 /:id 之前，否則會被 /:id 匹配）
router.get('/admin/trash', authenticateToken, requireAdmin, ProductController.getDeletedProducts);

// 公開路由 — 商品詳情（不需要登入）
router.get('/:id', ProductController.getProductById);

// 需要認證的路由
router.use(authenticateToken);

// 管理員路由
router.post('/', requireAdmin, ProductController.createProduct);
router.post('/bulk', requireAdmin, ProductController.createProductsBulk);
router.put('/:id', requireAdmin, ProductController.updateProduct);
router.delete('/:id', requireAdmin, ProductController.deleteProduct);

// 垃圾桶操作路由（需要管理员权限）
router.post('/:id/restore', requireAdmin, ProductController.restoreProduct);
router.delete('/:id/permanent', requireAdmin, ProductController.permanentlyDeleteProduct);

export default router;


