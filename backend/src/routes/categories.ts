import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { CategoryController } from '../controllers/categoryController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// 驗證 Schema
const createCategorySchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  slug: Joi.string().required().min(1).max(100).pattern(/^[a-z0-9-]+$/),
  description: Joi.string().allow('', null).max(500),
  image: Joi.string().uri().allow('', null),
  isActive: Joi.boolean().default(true),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100),
  slug: Joi.string().min(1).max(100).pattern(/^[a-z0-9-]+$/),
  description: Joi.string().allow('', null).max(500),
  image: Joi.string().uri().allow('', null),
  isActive: Joi.boolean(),
});

// 管理員路由（需要認證和管理員權限）
router.use(authenticateToken);
router.use(requireAdmin);

// 獲取分類列表
router.get('/', CategoryController.getCategories);

// 獲取單一分類
router.get('/:id', CategoryController.getCategoryById);

// 創建分類
router.post('/', validateRequest(createCategorySchema), CategoryController.createCategory);

// 更新分類
router.put('/:id', validateRequest(updateCategorySchema), CategoryController.updateCategory);

// 刪除分類
router.delete('/:id', CategoryController.deleteCategory);

export default router;

