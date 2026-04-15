import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { EventController } from '../controllers/eventController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// ─── Validation Schemas ───

const createEventSchema = Joi.object({
  title: Joi.string().required().min(1).max(200),
  slug: Joi.string().required().min(1).max(100).pattern(/^[a-z0-9\u4e00-\u9fff/-]+$/),
  description: Joi.string().required().min(1).max(5000),
  coverImage: Joi.string().max(500).allow('', null),
  location: Joi.string().max(300).allow('', null),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref('startDate')),
  status: Joi.string().valid('DRAFT', 'ACTIVE', 'ENDED', 'CANCELLED').default('DRAFT'),
  landingUrl: Joi.string().max(500).allow('', null),
  utmSource: Joi.string().max(100).allow('', null),
  utmMedium: Joi.string().max(100).allow('', null).default('qrcode'),
  utmCampaign: Joi.string().max(100).allow('', null),
  couponCode: Joi.string().max(50).allow('', null),
  discountNote: Joi.string().max(300).allow('', null),
  isActive: Joi.boolean().default(true),
  metadata: Joi.object().allow(null),
});

const updateEventSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  slug: Joi.string().min(1).max(100).pattern(/^[a-z0-9\u4e00-\u9fff/-]+$/),
  description: Joi.string().min(1).max(5000),
  coverImage: Joi.string().max(500).allow('', null),
  location: Joi.string().max(300).allow('', null),
  startDate: Joi.date(),
  endDate: Joi.date(),
  status: Joi.string().valid('DRAFT', 'ACTIVE', 'ENDED', 'CANCELLED'),
  landingUrl: Joi.string().max(500).allow('', null),
  utmSource: Joi.string().max(100).allow('', null),
  utmMedium: Joi.string().max(100).allow('', null),
  utmCampaign: Joi.string().max(100).allow('', null),
  couponCode: Joi.string().max(50).allow('', null),
  discountNote: Joi.string().max(300).allow('', null),
  isActive: Joi.boolean(),
  metadata: Joi.object().allow(null),
});

// ─── Public Routes ───

// Get active events
router.get('/', EventController.getActiveEvents);

// Get event by slug (wildcard to support slugs with slashes like "2026/spring-show")
router.get('/slug/*', EventController.getEventBySlug);

// Track QR code scan / referral click
router.get('/r/:code', EventController.trackClick);

// ─── Admin Routes ───

router.get('/admin', authenticateToken, requireAdmin, EventController.getAllEvents);
router.get('/admin/:id', authenticateToken, requireAdmin, EventController.getEventById);
router.get('/admin/:id/analytics', authenticateToken, requireAdmin, EventController.getEventAnalytics);
router.post('/admin', authenticateToken, requireAdmin, validateRequest(createEventSchema), EventController.createEvent);
router.put('/admin/:id', authenticateToken, requireAdmin, validateRequest(updateEventSchema), EventController.updateEvent);
router.delete('/admin/:id', authenticateToken, requireAdmin, EventController.deleteEvent);
router.patch('/admin/:id/toggle', authenticateToken, requireAdmin, EventController.toggleEvent);

export default router;
