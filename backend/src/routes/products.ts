import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ProductController } from '../controllers/productController';

const router = Router();

// 公開路由
router.get('/', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/categories', ProductController.getCategories);
router.get('/:id', ProductController.getProductById);

// 需要認證的路由
router.use(authenticateToken);

// 管理員路由
router.post('/', requireAdmin, ProductController.createProduct);
router.put('/:id', requireAdmin, ProductController.updateProduct);
router.delete('/:id', requireAdmin, ProductController.deleteProduct);

export default router;


