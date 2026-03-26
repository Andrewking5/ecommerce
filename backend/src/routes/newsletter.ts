import { Router } from 'express';
import { NewsletterController } from '../controllers/newsletterController';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = Router();

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

router.post(
  '/subscribe',
  newsletterLimiter,
  [body('email').isEmail().withMessage('Valid email is required')],
  NewsletterController.subscribe
);

router.post(
  '/unsubscribe',
  [body('email').isEmail().withMessage('Valid email is required')],
  NewsletterController.unsubscribe
);

export default router;
