import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { RegistrationController } from '../controllers/registrationController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

const submitSchema = Joi.object({
  // 所有活動通用（必填）
  name:      Joi.string().required().min(1).max(100),
  phone:     Joi.string().required().min(1).max(30),
  email:     Joi.string().email().required(),
  // Soul Guitar 專用（選填）
  stageName: Joi.string().max(100).allow('', null),
  socialId:  Joi.string().max(200).allow('', null),
  category:  Joi.string().valid('彈唱組', '演奏組').allow('', null),
  soulColor: Joi.string().valid('紅色', '橘色', '黃色', '藍色', '黑色', '白色').allow('', null),
  youtube:   Joi.string().min(5).max(500).allow('', null),
  fbIg:      Joi.string().min(5).max(500).allow('', null),
  rulesOk:   Joi.boolean(),
  message:   Joi.string().max(2000).allow('', null),
  // 未來活動彈性自訂欄位
  answers:   Joi.object().allow(null),
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
