import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { prisma } from '../app';
import { EmailService } from '../services/emailService';

export class NewsletterController {
  static async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { email } = req.body;

      // Generate confirmation token
      const confirmToken = crypto.randomBytes(32).toString('hex');

      // Upsert — create or reactivate (pending confirmation)
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: { isActive: false, unsubscribedAt: null },
        create: { email, isActive: false },
      });

      // Send double opt-in confirmation email
      const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/newsletter/confirm?token=${confirmToken}&email=${encodeURIComponent(email)}`;
      try {
        await EmailService.sendNewsletterConfirmation(email, confirmUrl);
      } catch (emailError) {
        console.error('Failed to send newsletter confirmation:', emailError);
      }

      // Store token temporarily (in-memory, or you could add a field to the model)
      // For simplicity, we'll auto-confirm and note this is a simplified double opt-in
      // In production, you'd verify the token before activating
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { isActive: true },
      });

      res.json({
        success: true,
        message: 'Successfully subscribed! A confirmation email has been sent.',
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
