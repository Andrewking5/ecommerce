import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { VariantController } from '../controllers/variantController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// 驗證 Schema
const createVariantSchema = Joi.object({
  productId: Joi.string().required(),
  sku: Joi.string().required().min(1).max(100),
  price: Joi.number().positive().precision(2).required(),
  comparePrice: Joi.number().positive().precision(2).allow(null),
  costPrice: Joi.number().positive().precision(2).allow(null),
  stock: Joi.number().integer().min(0).required(),
  reservedStock: Joi.number().integer().min(0).default(0),
  weight: Joi.number().positive().precision(2).allow(null),
  dimensions: Joi.object().allow(null),
  barcode: Joi.string().allow('', null),
  images: Joi.array().items(Joi.string().uri()).default([]),
  isDefault: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  attributes: Joi.array().items(
    Joi.object({
      attributeId: Joi.string().required(),
      value: Joi.string().required(),
      displayValue: Joi.string().allow('', null),
    })
  ).default([]),
});

const updateVariantSchema = Joi.object({
  sku: Joi.string().min(1).max(100),
  price: Joi.number().positive().precision(2),
  comparePrice: Joi.number().positive().precision(2).allow(null),
  costPrice: Joi.number().positive().precision(2).allow(null),
  stock: Joi.number().integer().min(0),
  reservedStock: Joi.number().integer().min(0),
  weight: Joi.number().positive().precision(2).allow(null),
  dimensions: Joi.object().allow(null),
  barcode: Joi.string().allow('', null),
  images: Joi.array().items(Joi.string().uri()),
  isDefault: Joi.boolean(),
  isActive: Joi.boolean(),
  attributes: Joi.array().items(
    Joi.object({
      attributeId: Joi.string().required(),
      value: Joi.string().required(),
      displayValue: Joi.string().allow('', null),
    })
  ),
});

const createVariantsBulkSchema = Joi.object({
  productId: Joi.string().required(),
  attributes: Joi.array().items(
    Joi.object({
      attributeId: Joi.string().required(),
      values: Joi.array().items(Joi.string()).min(1).required(),
    })
  ).min(1).required(),
  basePrice: Joi.number().positive().precision(2),
  defaultStock: Joi.number().integer().min(0).default(0),
  skuPattern: Joi.string().max(200),
});

const updateVariantsBulkSchema = Joi.object({
  variantIds: Joi.array().items(Joi.string()).min(1).required(),
  data: Joi.object({
    price: Joi.number().positive().precision(2),
    stock: Joi.number().integer().min(0),
    isActive: Joi.boolean(),
  }).min(1).required(),
});

const generateSKUSchema = Joi.object({
  productId: Joi.string().required(),
  pattern: Joi.string().required().max(200),
  attributes: Joi.array().items(
    Joi.object({
      attributeId: Joi.string().required(),
      value: Joi.string().required(),
    })
  ).min(1).required(),
});

// 公開路由（獲取變體列表和詳情）
router.get('/product/:productId', VariantController.getProductVariants);
router.get('/:id', VariantController.getVariantById);

// 需要認證的路由
router.use(authenticateToken);
router.use(requireAdmin);

// 變體管理路由
router.post('/', validateRequest(createVariantSchema), VariantController.createVariant);
router.post('/bulk', validateRequest(createVariantsBulkSchema), VariantController.createVariantsBulk);
router.put('/:id', validateRequest(updateVariantSchema), VariantController.updateVariant);
router.put('/bulk/update', validateRequest(updateVariantsBulkSchema), VariantController.updateVariantsBulk);
router.delete('/:id', VariantController.deleteVariant);

// SKU 生成工具
router.post('/generate-sku', validateRequest(generateSKUSchema), VariantController.generateSKU);

// 更新变体顺序
const updateOrderSchema = Joi.object({
  variantIds: Joi.array().items(Joi.string()).min(1).required(),
});

router.put('/update-order', validateRequest(updateOrderSchema), VariantController.updateVariantsOrder);

export default router;

