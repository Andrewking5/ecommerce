import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ProductController } from '../controllers/productController';

const router = Router();

// 公開路由
router.get('/', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/categories', ProductController.getCategories);

// 需要認證的路由
router.use(authenticateToken);

// 垃圾桶相关路由（需要管理员权限，必须在 /:id 之前）
router.get('/admin/trash', requireAdmin, ProductController.getDeletedProducts);

// 公開路由（需要在认证之后，但在 /:id 之前）
router.get('/:id', ProductController.getProductById);

// 管理員路由
router.post('/', requireAdmin, ProductController.createProduct);
router.post('/bulk', requireAdmin, ProductController.createProductsBulk);
router.put('/:id', requireAdmin, ProductController.updateProduct);
router.delete('/:id', requireAdmin, ProductController.deleteProduct);

// 垃圾桶操作路由（需要管理员权限）
router.post('/:id/restore', requireAdmin, ProductController.restoreProduct);
router.delete('/:id/permanent', requireAdmin, ProductController.permanentlyDeleteProduct);

export default router;


