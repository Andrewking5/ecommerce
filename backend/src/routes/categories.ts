import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { CategoryController } from '../controllers/categoryController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// 驗證 Schema
// 自定义图片 URL 验证：允许空值、完整 URL 或相对路径
const imageUrlSchema = Joi.string().allow('', null).custom((value, helpers) => {
  if (!value || value.trim() === '') return value;
  const trimmed = value.trim();
  // 完整 URL (http:// 或 https://)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return helpers.error('string.uri');
    }
  }
  // 相对路径 (以 / 开头)
  if (trimmed.startsWith('/') && trimmed.length > 1) {
    return trimmed;
  }
  return helpers.error('string.uri');
});

const createCategorySchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  slug: Joi.string().required().min(1).max(100).pattern(/^[a-z0-9-]+$/),
  description: Joi.string().allow('', null).max(500),
  image: imageUrlSchema,
  isActive: Joi.boolean().default(true),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100),
  slug: Joi.string().min(1).max(100).pattern(/^[a-z0-9-]+$/),
  description: Joi.string().allow('', null).max(500),
  image: imageUrlSchema,
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

