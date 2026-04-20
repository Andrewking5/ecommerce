import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { RegistrationController } from '../controllers/registrationController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const submitSchema = Joi.object({
  name:      Joi.string().required().min(1).max(100),
  stageName: Joi.string().max(100).allow('', null),
  phone:     Joi.string().required().min(1).max(30),
  email:     Joi.string().email().required(),
  socialId:  Joi.string().required().min(1).max(200),
  category:  Joi.string().valid('彈唱組', '演奏組').required(),
  soulColor: Joi.string().valid('紅色', '橘色', '黃色', '藍色', '黑色', '白色').required(),
  youtube:   Joi.string().required().min(5).max(500),
  fbIg:      Joi.string().required().min(5).max(500),
  rulesOk:   Joi.boolean().required(),
  message:   Joi.string().max(2000).allow('', null),
});

const settingsSchema = Joi.object({
  registrationOpen:  Joi.boolean(),
  registrationLimit: Joi.number().integer().min(0).max(10000),
}).min(1);

// ─── Public ───
// Use wildcard to support slugs with slashes e.g. "soul-guitar/register"
router.get('/status/*',  RegistrationController.getStatus);
router.post('/submit/*', validateRequest(submitSchema), RegistrationController.submit);

// ─── Admin ───
router.get('/admin/:eventId',          authenticateToken, requireAdmin, RegistrationController.list);
router.get('/admin/:eventId/export',   authenticateToken, requireAdmin, RegistrationController.exportCsv);
router.delete('/admin/:id',            authenticateToken, requireAdmin, RegistrationController.deleteOne);
router.patch('/admin/:eventId/settings', authenticateToken, requireAdmin, validateRequest(settingsSchema), RegistrationController.updateSettings);

export default router;
