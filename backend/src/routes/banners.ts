import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { BannerController } from '../controllers/bannerController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Validation Schemas
const createBannerSchema = Joi.object({
  slug: Joi.string().required().min(1).max(100).pattern(/^[a-z0-9-]+$/),
  subtitle: Joi.string().required().min(1).max(200),
  titleWord1: Joi.string().required().min(1).max(100),
  titleWord2: Joi.string().required().min(1).max(100),
  titleColor1: Joi.string().max(100).default('text-ayers-warm-cream'),
  titleColor2: Joi.string().max(100).default('text-ayers-gold'),
  body: Joi.string().required().min(1).max(1000),
  ctaLabel: Joi.string().required().min(1).max(100),
  ctaLink: Joi.string().required().min(1).max(500),
  image: Joi.string().required().min(1).max(500),
  displayOrder: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

const updateBannerSchema = Joi.object({
  slug: Joi.string().min(1).max(100).pattern(/^[a-z0-9-]+$/),
  subtitle: Joi.string().min(1).max(200),
  titleWord1: Joi.string().min(1).max(100),
  titleWord2: Joi.string().min(1).max(100),
  titleColor1: Joi.string().max(100),
  titleColor2: Joi.string().max(100),
  body: Joi.string().min(1).max(1000),
  ctaLabel: Joi.string().min(1).max(100),
  ctaLink: Joi.string().min(1).max(500),
  image: Joi.string().min(1).max(500),
  displayOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
});

const reorderBannersSchema = Joi.object({
  orders: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      displayOrder: Joi.number().integer().min(0).required(),
    })
  ).required().min(1),
});

// Public route: get active banners (no auth required)
router.get('/', BannerController.getActiveBanners);

// Admin routes (require auth + admin)
router.get('/admin', authenticateToken, requireAdmin, BannerController.getAllBanners);
router.get('/admin/:id', authenticateToken, requireAdmin, BannerController.getBannerById);
router.post('/admin', authenticateToken, requireAdmin, validateRequest(createBannerSchema), BannerController.createBanner);
router.put('/admin/:id', authenticateToken, requireAdmin, validateRequest(updateBannerSchema), BannerController.updateBanner);
router.delete('/admin/:id', authenticateToken, requireAdmin, BannerController.deleteBanner);
router.patch('/admin/:id/toggle', authenticateToken, requireAdmin, BannerController.toggleBanner);
router.put('/admin/reorder', authenticateToken, requireAdmin, validateRequest(reorderBannersSchema), BannerController.reorderBanners);

export default router;
