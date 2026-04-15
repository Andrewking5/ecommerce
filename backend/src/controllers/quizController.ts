import { Request, Response } from 'express';
import { prisma } from '../app';

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
