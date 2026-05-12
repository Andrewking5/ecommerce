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

      const { name, stageName, phone, email, socialId, category, soulColor, youtube, fbIg, rulesOk, message, answers } = req.body;

      // 不擋重複報名：允許同 email 在同一場活動內報多筆（不同組別 / 重複試填皆放行），
      // 由後台人工依規則處理。

      const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || null;

      const registration = await prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          stageName: stageName?.trim() || null,
          socialId: socialId?.trim() || null,
          category: category || null,
          soulColor: soulColor || null,
          youtube: youtube?.trim() || null,
          fbIg: fbIg?.trim() || null,
          rulesOk: !!rulesOk,
          message: message?.trim() || null,
          answers: answers ?? null,
          ip,
        },
      });

      res.status(201).json({ success: true, data: { id: registration.id } });

      // 非同步寄信，不阻塞 response
      EmailService.sendSoulGuitarRegistration(registration.email).catch((err) =>
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
        orderBy: { createdAt: 'asc' },
      });
      const total = registrations.length;
      res.json({ success: true, data: registrations, total });
    } catch (error) {
      console.error('Failed to list registrations:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  /** Export registrations as CSV (dynamic columns from answers) */
  static async exportCsv(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } });
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        orderBy: { createdAt: 'asc' },
      });

      // Collect all answer keys across all registrations
      const answerKeys = Array.from(
        new Set(
          registrations.flatMap((r) =>
            r.answers && typeof r.answers === 'object' ? Object.keys(r.answers as Record<string, unknown>) : []
          )
        )
      );

      // Fixed columns always shown
      const fixedHeaders = ['編號', '報名時間', '姓名', '藝名', '手機', 'Email'];
      // Soul Guitar columns only if any record has them
      const hasSoulGuitarFields = registrations.some((r) => r.category || r.soulColor || r.youtube || r.fbIg);
      const soulHeaders = hasSoulGuitarFields ? ['社群帳號', '組別', '靈魂顏色', 'YouTube', 'FB/IG', '了解規則'] : [];
      const headers = [...fixedHeaders, ...soulHeaders, ...answerKeys, '留言'];

      const rows = registrations.map((r, i) => {
        const answers = (r.answers && typeof r.answers === 'object' ? r.answers : {}) as Record<string, unknown>;
        return [
          i + 1,
          new Date(r.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
          r.name,
          r.stageName || '',
          r.phone,
          r.email,
          ...(hasSoulGuitarFields ? [r.socialId || '', r.category || '', r.soulColor || '', r.youtube || '', r.fbIg || '', r.rulesOk ? '是' : '否'] : []),
          ...answerKeys.map((k) => String(answers[k] ?? '')),
          r.message || '',
        ];
      });

      const csv = [headers, ...rows]
        .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const slug = event?.slug ?? eventId;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="registrations-${slug}-${Date.now()}.csv"`);
      res.send('\uFEFF' + csv);
    } catch (error) {
      console.error('Failed to export registrations:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  /** Update a single registration (admin) */
  static async updateOne(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const existing = await prisma.eventRegistration.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Registration not found' });
        return;
      }

      const { name, phone, email, stageName, socialId, category, soulColor, youtube, fbIg, rulesOk, message } = req.body;

      const updated = await prisma.eventRegistration.update({
        where: { id },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(phone !== undefined && { phone: phone.trim() }),
          ...(email !== undefined && { email: email.trim().toLowerCase() }),
          ...(stageName !== undefined && { stageName: stageName?.trim() || null }),
          ...(socialId !== undefined && { socialId: socialId?.trim() || null }),
          ...(category !== undefined && { category: category || null }),
          ...(soulColor !== undefined && { soulColor: soulColor || null }),
          ...(youtube !== undefined && { youtube: youtube?.trim() || null }),
          ...(fbIg !== undefined && { fbIg: fbIg?.trim() || null }),
          ...(rulesOk !== undefined && { rulesOk: Boolean(rulesOk) }),
          ...(message !== undefined && { message: message?.trim() || null }),
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        res.status(409).json({ success: false, error: '此 Email 已被其他報名使用' });
        return;
      }
      console.error('Failed to update registration:', error);
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

  // TODO: TEMP TEST — delete this method when email is confirmed working
  /** Send a test registration email to verify email service */
  static async testEmail(req: Request, res: Response): Promise<void> {
    const to = (req.body.email as string) || process.env.GMAIL_USER || '';
    if (!to) {
      res.status(400).json({ success: false, error: 'No target email' });
      return;
    }
    try {
      await EmailService.sendSoulGuitarRegistration(to);
      res.json({ success: true, message: `Email sent to ${to}` });
    } catch (err: any) {
      console.error('Test email error:', err);
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  }

  /** GET /api/registrations/admin/:eventId/referral-stats — count registrations per 得知管道 */
  static async referralStats(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        select: { answers: true },
      });

      const counts = new Map<string, number>();
      let unknown = 0;
      for (const r of registrations) {
        const ans = (r.answers && typeof r.answers === 'object' ? r.answers : null) as Record<string, unknown> | null;
        const raw = ans?.['得知管道'];
        if (typeof raw !== 'string' || !raw.trim()) {
          unknown += 1;
          continue;
        }
        // 「其他：xxx」自由填寫的歸到「其他」一個桶
        const label = raw.startsWith('其他：') || raw === '其他' ? '其他' : raw;
        counts.set(label, (counts.get(label) || 0) + 1);
      }

      const data = Array.from(counts.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      res.json({ success: true, total: registrations.length, unknown, data });
    } catch (error) {
      console.error('Failed to compute referral stats:', error);
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
