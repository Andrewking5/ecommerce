import { Request, Response } from 'express';
import { prisma } from '../app';

const VALID_SHARE_SLUGS = new Set([
  'fire', 'fireworks', 'sun', 'glow', 'wave', 'deep-sea', 'moon', 'dream-moon',
]);

const VALID_SLUGS = new Set([
  'fire', 'fireworks', 'sun', 'glow', 'wave', 'deep-sea', 'moon', 'dream-moon',
]);

const SLUG_LABEL: Record<string, string> = {
  'fire':       '火焰 (FIRE_自由)',
  'fireworks':  '煙火 (FIRE_故事)',
  'sun':        '太陽 (SUN_自由)',
  'glow':       '微光 (SUN_故事)',
  'wave':       '海浪 (WAVE_自由)',
  'deep-sea':   '深海 (WAVE_故事)',
  'moon':       '月光 (MOON_故事)',
  'dream-moon': '夢月 (MOON_自由)',
};

export class QuizController {
  /** POST /api/quiz/results — track one quiz completion (public, no auth) */
  static async trackResult(req: Request, res: Response): Promise<void> {
    try {
      const { slug, resultKey } = req.body as { slug?: string; resultKey?: string };

      if (!slug || !VALID_SLUGS.has(slug)) {
        res.status(400).json({ success: false, error: 'Invalid slug' });
        return;
      }

      // Simple device detection from User-Agent
      const ua = (req.headers['user-agent'] || '').toLowerCase();
      let device = 'desktop';
      if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
        device = /ipad|tablet/.test(ua) ? 'tablet' : 'mobile';
      }

      await prisma.quizResult.create({
        data: { slug, resultKey: resultKey || slug, device },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to track quiz result:', error);
      res.status(500).json({ success: false, error: 'Failed to track' });
    }
  }

  /** POST /api/quiz/share-email — 分享後抽獎 email 登記（public） */
  static async trackShareEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, slug, resultKey } = req.body as { email?: string; slug?: string; resultKey?: string };

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ success: false, error: 'Invalid email' });
        return;
      }
      if (!slug || !VALID_SHARE_SLUGS.has(slug)) {
        res.status(400).json({ success: false, error: 'Invalid slug' });
        return;
      }

      await prisma.quizShareEmail.upsert({
        where: { email_slug: { email, slug } },
        update: {},  // 已存在就不更新（不重複計算）
        create: { email, slug, resultKey: resultKey || null },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to track share email:', error);
      res.status(500).json({ success: false, error: 'Failed to save' });
    }
  }

  /** GET /api/quiz/admin/share-emails — 查看所有分享抽獎 email（admin only） */
  static async listShareEmails(req: Request, res: Response): Promise<void> {
    try {
      const { slug, format } = req.query as { slug?: string; format?: string };

      const rows = await prisma.quizShareEmail.findMany({
        where: slug ? { slug } : undefined,
        orderBy: { createdAt: 'desc' },
        select: { email: true, slug: true, resultKey: true, createdAt: true },
      });

      if (format === 'csv') {
        const csv = ['email,slug,resultKey,createdAt', ...rows.map((r: { email: string; slug: string; resultKey: string | null; createdAt: Date }) =>
          `${r.email},${r.slug},${r.resultKey ?? ''},${r.createdAt.toISOString()}`
        )].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="quiz-share-emails.csv"');
        res.send(csv);
        return;
      }

      res.json({ success: true, total: rows.length, data: rows });
    } catch (error) {
      console.error('Failed to list share emails:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch' });
    }
  }

  /** DELETE /api/quiz/admin/share-emails — delete a single share-email entry (admin only) */
  static async deleteShareEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, slug } = req.body as { email?: string; slug?: string };
      if (!email || !slug) {
        res.status(400).json({ success: false, error: 'email and slug are required' });
        return;
      }
      await prisma.quizShareEmail.delete({ where: { email_slug: { email, slug } } });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete share email:', error);
      res.status(500).json({ success: false, error: 'Failed to delete' });
    }
  }

  /** DELETE /api/quiz/admin/results — wipe all quiz results (admin only) */
  static async clearResults(req: Request, res: Response): Promise<void> {
    try {
      const { count } = await prisma.quizResult.deleteMany();
      res.json({ success: true, deleted: count });
    } catch (error) {
      console.error('Failed to clear quiz results:', error);
      res.status(500).json({ success: false, error: 'Failed to clear' });
    }
  }

  /** GET /api/quiz/layout/:slug — get layout config (public) */
  static async getLayout(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const row = await prisma.quizLayout.findUnique({ where: { slug } });
      res.json({ success: true, data: row?.config ?? null });
    } catch (error) {
      console.error('Failed to get quiz layout:', error);
      res.status(500).json({ success: false, error: 'Failed to get layout' });
    }
  }

  /** PUT /api/quiz/admin/layout/:slug — save layout config (admin only) */
  static async saveLayout(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const config = req.body;
      if (!slug || typeof config !== 'object') {
        res.status(400).json({ success: false, error: 'Invalid data' });
        return;
      }
      await prisma.quizLayout.upsert({
        where: { slug },
        update: { config },
        create: { slug, config },
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to save quiz layout:', error);
      res.status(500).json({ success: false, error: 'Failed to save layout' });
    }
  }

  /** GET /api/quiz/admin/analytics — full analytics (admin only) */
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const [total, bySlug, byDevice, daily] = await Promise.all([
        // Total completions
        prisma.quizResult.count(),

        // Count per slug
        prisma.quizResult.groupBy({
          by: ['slug'],
          _count: true,
          orderBy: { _count: { slug: 'desc' } },
        }),

        // Count per device
        prisma.quizResult.groupBy({
          by: ['device'],
          _count: true,
        }),

        // Daily completions (last 30 days)
        prisma.quizResult.findMany({
          select: { createdAt: true },
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

      // Aggregate by day
      const dailyMap = new Map<string, number>();
      daily.forEach((r: { createdAt: Date }) => {
        const day = r.createdAt.toISOString().slice(0, 10);
        dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
      });

      res.json({
        success: true,
        data: {
          total,
          byResult: bySlug.map((r: { slug: string; _count: number }) => ({
            slug: r.slug,
            label: SLUG_LABEL[r.slug] || r.slug,
            count: r._count,
          })),
          byDevice: byDevice.map((d: { device: string | null; _count: number }) => ({
            device: d.device || 'unknown',
            count: d._count,
          })),
          daily: Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count })),
        },
      });
    } catch (error) {
      console.error('Failed to fetch quiz analytics:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
  }
}
