import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { AttributeController } from '../controllers/attributeController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';
import { AttributeType } from '../types/variant';

const router = Router();

// 驗證 Schema
const createAttributeSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  displayName: Joi.string().allow('', null).max(100),
  type: Joi.string().valid(...Object.values(AttributeType)).required(),
  categoryId: Joi.string().allow('', null),
  values: Joi.any().required(), // JSON 类型
  isRequired: Joi.boolean().default(false),
  displayOrder: Joi.number().integer().min(0).default(0),
});

const updateAttributeSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  displayName: Joi.string().allow('', null).max(100),
  type: Joi.string().valid(...Object.values(AttributeType)),
  categoryId: Joi.string().allow('', null),
  values: Joi.any(),
  isRequired: Joi.boolean(),
  displayOrder: Joi.number().integer().min(0),
});

const createTemplateSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  categoryId: Joi.string().allow('', null),
  attributes: Joi.any().required(), // JSON 类型
  isDefault: Joi.boolean().default(false),
});

const updateTemplateSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  categoryId: Joi.string().allow('', null),
  attributes: Joi.any(),
  isDefault: Joi.boolean(),
});

// 公開路由（獲取屬性列表和詳情）
router.get('/', AttributeController.getAttributes);
router.get('/:id', AttributeController.getAttributeById);

// 模板路由（公開）
router.get('/templates/list', AttributeController.getAttributeTemplates);
router.get('/templates/:id', AttributeController.getAttributeTemplateById);

// 需要認證的路由
router.use(authenticateToken);
router.use(requireAdmin);

// 屬性管理路由
router.post('/', validateRequest(createAttributeSchema), AttributeController.createAttribute);
router.put('/:id', validateRequest(updateAttributeSchema), AttributeController.updateAttribute);
router.delete('/:id', AttributeController.deleteAttribute);

// 模板管理路由
router.post('/templates', validateRequest(createTemplateSchema), AttributeController.createAttributeTemplate);
router.put('/templates/:id', validateRequest(updateTemplateSchema), AttributeController.updateAttributeTemplate);
router.delete('/templates/:id', AttributeController.deleteAttributeTemplate);

export default router;

