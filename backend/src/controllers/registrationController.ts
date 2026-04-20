import { Request, Response } from 'express';
import { prisma } from '../app';
import { EmailService } from '../services/emailService';

export class RegistrationController {
  // ─── Public ───

  /** Check if registration is open + current count */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const eventSlug = req.params[0] || req.params.eventSlug;
      const event = await prisma.event.findUnique({
        where: { slug: eventSlug },
        select: { id: true, registrationOpen: true, registrationLimit: true, _count: { select: { registrations: true } } },
      });
      if (!event) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      const count = event._count.registrations;
      const full = event.registrationLimit > 0 && count >= event.registrationLimit;
      res.json({
        success: true,
        data: {
          open: event.registrationOpen && !full,
          count,
          limit: event.registrationLimit,
          full,
        },
      });
    } catch (error) {
      console.error('Failed to get registration status:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  /** Submit a new registration (public) */
  static async submit(req: Request, res: Response): Promise<void> {
    try {
      const eventSlug = req.params[0] || req.params.eventSlug;
      const event = await prisma.event.findUnique({
        where: { slug: eventSlug },
        select: { id: true, registrationOpen: true, registrationLimit: true, _count: { select: { registrations: true } } },
      });

      if (!event) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      if (!event.registrationOpen) {
        res.status(403).json({ success: false, error: '報名目前未開放' });
        return;
      }
      const count = event._count.registrations;
      if (event.registrationLimit > 0 && count >= event.registrationLimit) {
        res.status(409).json({ success: false, error: '報名名額已滿' });
        return;
      }

      const { name, stageName, phone, email, socialId, category, soulColor, youtube, fbIg, rulesOk, message } = req.body;

      const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || null;

      const registration = await prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          name: name.trim(),
          stageName: stageName?.trim() || null,
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          socialId: socialId.trim(),
          category,
          soulColor,
          youtube: youtube.trim(),
          fbIg: fbIg.trim(),
          rulesOk: !!rulesOk,
          message: message?.trim() || null,
          ip,
        },
      });

      res.status(201).json({ success: true, data: { id: registration.id } });

      // 非同步寄信，不阻塞 response
      EmailService.sendSoulGuitarRegistration(registration.email, registration.name).catch((err) =>
        console.error('Failed to send registration email:', err)
      );
    } catch (error) {
      console.error('Failed to submit registration:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  // ─── Admin ───

  /** List all registrations for an event */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
      });
      const total = registrations.length;
      res.json({ success: true, data: registrations, total });
    } catch (error) {
      console.error('Failed to list registrations:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  /** Export registrations as CSV */
  static async exportCsv(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } });
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        orderBy: { createdAt: 'asc' },
      });

      const headers = ['編號', '報名時間', '姓名', '藝名', '手機', 'Email', '社群帳號', '組別', '靈魂顏色', 'YouTube', 'FB/IG', '了解規則', '留言'];
      const rows = registrations.map((r: typeof registrations[number], i: number) => [
        i + 1,
        new Date(r.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        r.name,
        r.stageName || '',
        r.phone,
        r.email,
        r.socialId,
        r.category,
        r.soulColor,
        r.youtube,
        r.fbIg,
        r.rulesOk ? '是' : '否',
        r.message || '',
      ]);

      const csv = [headers, ...rows]
        .map((row: (string | number | boolean)[]) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const slug = event?.slug ?? eventId;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="registrations-${slug}-${Date.now()}.csv"`);
      res.send('\uFEFF' + csv); // BOM for Excel
    } catch (error) {
      console.error('Failed to export registrations:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  /** Delete a single registration */
  static async deleteOne(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const existing = await prisma.eventRegistration.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Registration not found' });
        return;
      }
      await prisma.eventRegistration.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete registration:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  /** Update registration settings on an event (open/limit) */
  static async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { registrationOpen, registrationLimit } = req.body;

      const existing = await prisma.event.findUnique({ where: { id: eventId } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }

      const event = await prisma.event.update({
        where: { id: eventId },
        data: {
          ...(registrationOpen !== undefined && { registrationOpen: Boolean(registrationOpen) }),
          ...(registrationLimit !== undefined && { registrationLimit: Number(registrationLimit) }),
        },
        select: { id: true, registrationOpen: true, registrationLimit: true },
      });

      res.json({ success: true, data: event });
    } catch (error) {
      console.error('Failed to update registration settings:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
}
