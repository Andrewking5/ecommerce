import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../app';

export class NewsletterController {
  static async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { email } = req.body;

      // Upsert — reactivate if previously unsubscribed
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: { isActive: true, unsubscribedAt: null },
        create: { email },
      });

      res.json({
        success: true,
        message: 'Successfully subscribed to our newsletter!',
      });
    } catch (error) {
      console.error('Newsletter subscribe error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe. Please try again later.',
      });
    }
  }

  static async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { email } = req.body;

      await prisma.newsletterSubscriber.updateMany({
        where: { email },
        data: { isActive: false, unsubscribedAt: new Date() },
      });

      res.json({
        success: true,
        message: 'Successfully unsubscribed.',
      });
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unsubscribe. Please try again later.',
      });
    }
  }
}
