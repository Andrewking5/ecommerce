import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../app';
import { EmailService } from '../services/emailService';

export class ContactController {
  static async submitContact(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { name, email, subject, message } = req.body;

      // Save to database
      await prisma.contactInquiry.create({
        data: { name, email, subject, message },
      });

      // Send admin notification
      try {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'info@ayersguitars.com';
        await EmailService.sendContactNotification(adminEmail, { name, email, subject, message });
      } catch (emailError) {
        console.error('Failed to send contact admin notification:', emailError);
      }

      // Send auto-reply to customer
      try {
        await EmailService.sendContactAutoReply(email, { name });
      } catch (emailError) {
        console.error('Failed to send contact auto-reply:', emailError);
      }

      res.json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon.',
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.',
      });
    }
  }
}
