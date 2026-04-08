import { Request, Response } from 'express';
import { prisma } from '../app';
import crypto from 'crypto';

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function detectDevice(ua: string | undefined): string {
  if (!ua) return 'unknown';
  if (/mobile|android|iphone|ipad/i.test(ua)) return /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
  return 'desktop';
}

export class EventController {
  // ─── Public ───

  /** Get active events for public listing */
  static async getActiveEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await prisma.event.findMany({
        where: {
          isActive: true,
          status: 'ACTIVE',
          endDate: { gte: new Date() },
        },
        orderBy: { startDate: 'asc' },
        select: {
          id: true, title: true, slug: true, description: true,
          coverImage: true, location: true, startDate: true, endDate: true,
          status: true, couponCode: true, discountNote: true,
        },
      });
      res.json({ success: true, data: events });
    } catch (error) {
      console.error('Failed to fetch active events:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
  }

  /** Get single event by slug (public) */
  static async getEventBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const event = await prisma.event.findUnique({
        where: { slug },
        select: {
          id: true, title: true, slug: true, description: true,
          coverImage: true, location: true, startDate: true, endDate: true,
          status: true, couponCode: true, discountNote: true,
          referralCode: true, landingUrl: true,
        },
      });
      if (!event) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      res.json({ success: true, data: event });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch event' });
    }
  }

  /** Track QR code scan / referral click */
  static async trackClick(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const event = await prisma.event.findUnique({ where: { referralCode: code } });
      if (!event) {
        res.status(404).json({ success: false, error: 'Invalid referral code' });
        return;
      }

      const ua = req.headers['user-agent'];
      const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || null;

      await prisma.$transaction([
        prisma.eventClick.create({
          data: {
            eventId: event.id,
            ip,
            userAgent: ua || null,
            referer: req.headers.referer || null,
            device: detectDevice(ua),
          },
        }),
        prisma.event.update({
          where: { id: event.id },
          data: { totalScans: { increment: 1 } },
        }),
      ]);

      // Redirect to landing URL or event page
      const redirectUrl = event.landingUrl || `/e/${event.slug}`;
      res.json({ success: true, redirectUrl });
    } catch (error) {
      console.error('Failed to track click:', error);
      res.status(500).json({ success: false, error: 'Failed to track click' });
    }
  }

  // ─── Admin ───

  /** Get all events (admin) */
  static async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { clicks: true } } },
      });
      res.json({ success: true, data: events });
    } catch (error) {
      console.error('Failed to fetch all events:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
  }

  /** Get single event by ID (admin) */
  static async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await prisma.event.findUnique({
        where: { id },
        include: { _count: { select: { clicks: true } } },
      });
      if (!event) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      res.json({ success: true, data: event });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch event' });
    }
  }

  /** Create event */
  static async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const {
        title, slug, description, coverImage, location,
        startDate, endDate, status,
        landingUrl, utmSource, utmMedium, utmCampaign,
        couponCode, discountNote, isActive,
      } = req.body;

      // Check slug uniqueness
      const existing = await prisma.event.findUnique({ where: { slug } });
      if (existing) {
        res.status(409).json({ success: false, error: 'An event with this slug already exists' });
        return;
      }

      // Generate unique referral code
      let referralCode = generateReferralCode();
      while (await prisma.event.findUnique({ where: { referralCode } })) {
        referralCode = generateReferralCode();
      }

      const event = await prisma.event.create({
        data: {
          title,
          slug,
          description,
          coverImage: coverImage || null,
          location: location || null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: status || 'DRAFT',
          referralCode,
          landingUrl: landingUrl || null,
          utmSource: utmSource || null,
          utmMedium: utmMedium || 'qrcode',
          utmCampaign: utmCampaign || null,
          couponCode: couponCode || null,
          discountNote: discountNote || null,
          isActive: isActive ?? true,
        },
      });

      res.status(201).json({ success: true, data: event });
    } catch (error) {
      console.error('Failed to create event:', error);
      res.status(500).json({ success: false, error: 'Failed to create event' });
    }
  }

  /** Update event */
  static async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        title, slug, description, coverImage, location,
        startDate, endDate, status,
        landingUrl, utmSource, utmMedium, utmCampaign,
        couponCode, discountNote, isActive,
      } = req.body;

      const existing = await prisma.event.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }

      // Check slug uniqueness if changing
      if (slug && slug !== existing.slug) {
        const slugExists = await prisma.event.findUnique({ where: { slug } });
        if (slugExists) {
          res.status(409).json({ success: false, error: 'An event with this slug already exists' });
          return;
        }
      }

      const event = await prisma.event.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(slug !== undefined && { slug }),
          ...(description !== undefined && { description }),
          ...(coverImage !== undefined && { coverImage }),
          ...(location !== undefined && { location }),
          ...(startDate !== undefined && { startDate: new Date(startDate) }),
          ...(endDate !== undefined && { endDate: new Date(endDate) }),
          ...(status !== undefined && { status }),
          ...(landingUrl !== undefined && { landingUrl }),
          ...(utmSource !== undefined && { utmSource }),
          ...(utmMedium !== undefined && { utmMedium }),
          ...(utmCampaign !== undefined && { utmCampaign }),
          ...(couponCode !== undefined && { couponCode }),
          ...(discountNote !== undefined && { discountNote }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({ success: true, data: event });
    } catch (error) {
      console.error('Failed to update event:', error);
      res.status(500).json({ success: false, error: 'Failed to update event' });
    }
  }

  /** Delete event */
  static async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const existing = await prisma.event.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      await prisma.event.delete({ where: { id } });
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Failed to delete event:', error);
      res.status(500).json({ success: false, error: 'Failed to delete event' });
    }
  }

  /** Toggle event active status */
  static async toggleEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const existing = await prisma.event.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      const event = await prisma.event.update({
        where: { id },
        data: { isActive: !existing.isActive },
      });
      res.json({ success: true, data: event });
    } catch (error) {
      console.error('Failed to toggle event:', error);
      res.status(500).json({ success: false, error: 'Failed to toggle event' });
    }
  }

  /** Get click analytics for an event */
  static async getEventAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }

      const [clicks, deviceStats, dailyClicks] = await Promise.all([
        prisma.eventClick.count({ where: { eventId: id } }),
        prisma.eventClick.groupBy({
          by: ['device'],
          where: { eventId: id },
          _count: true,
        }),
        prisma.eventClick.groupBy({
          by: ['createdAt'],
          where: { eventId: id },
          _count: true,
          orderBy: { createdAt: 'asc' },
        }),
      ]);

      // Aggregate daily clicks
      const dailyMap = new Map<string, number>();
      dailyClicks.forEach((row) => {
        const day = new Date(row.createdAt).toISOString().slice(0, 10);
        dailyMap.set(day, (dailyMap.get(day) || 0) + row._count);
      });
      const daily = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

      res.json({
        success: true,
        data: {
          totalClicks: clicks,
          totalScans: event.totalScans,
          uniqueVisitors: event.uniqueVisitors,
          deviceBreakdown: deviceStats.map((d) => ({ device: d.device || 'unknown', count: d._count })),
          dailyClicks: daily,
        },
      });
    } catch (error) {
      console.error('Failed to fetch event analytics:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
  }
}
