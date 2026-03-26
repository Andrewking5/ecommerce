import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { CustomConfigController } from '../controllers/customConfigController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createConfigSchema = Joi.object({
  title: Joi.string().required().min(1).max(200),
  selections: Joi.object().required(),
  uploads: Joi.object().allow(null),
  thumbnail: Joi.string().allow(null, '').max(1000),
  totalPrice: Joi.number().required().min(0),
  isPublic: Joi.boolean().default(false),
});

const updateConfigSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  selections: Joi.object(),
  uploads: Joi.object().allow(null),
  thumbnail: Joi.string().allow(null, '').max(1000),
  totalPrice: Joi.number().min(0),
  isPublic: Joi.boolean(),
});

// Public: browse community gallery (optionally includes liked status if logged in)
router.get('/public', CustomConfigController.getPublicConfigs);

// Auth required routes
router.get('/mine', authenticateToken, CustomConfigController.getMyConfigs);
router.post('/', authenticateToken, validateRequest(createConfigSchema), CustomConfigController.createConfig);
router.put('/:id', authenticateToken, validateRequest(updateConfigSchema), CustomConfigController.updateConfig);
router.delete('/:id', authenticateToken, CustomConfigController.deleteConfig);
router.post('/:id/like', authenticateToken, CustomConfigController.toggleLike);

export default router;
