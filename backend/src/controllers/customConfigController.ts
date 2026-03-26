import { Request, Response } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';

export class CustomConfigController {
  // Public: list public configs (gallery)
  static async getPublicConfigs(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
      const sort = (req.query.sort as string) === 'latest' ? 'createdAt' : 'likes';

      const [configs, total] = await Promise.all([
        prisma.customConfig.findMany({
          where: { isPublic: true },
          orderBy: { [sort]: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        }),
        prisma.customConfig.count({ where: { isPublic: true } }),
      ]);

      // If the requester is logged in, check which ones they liked
      const authReq = req as AuthRequest;
      let likedIds: Set<string> = new Set();
      if (authReq.user?.id) {
        const likes = await prisma.customConfigLike.findMany({
          where: {
            userId: authReq.user.id,
            configId: { in: configs.map(c => c.id) },
          },
          select: { configId: true },
        });
        likedIds = new Set(likes.map(l => l.configId));
      }

      const data = configs.map(c => ({
        id: c.id,
        title: c.title,
        selections: c.selections,
        uploads: c.uploads,
        thumbnail: c.thumbnail,
        totalPrice: c.totalPrice,
        likes: c.likes,
        liked: likedIds.has(c.id),
        author: {
          id: c.user.id,
          name: `${c.user.firstName} ${c.user.lastName}`.trim(),
          avatar: c.user.avatar,
        },
        createdAt: c.createdAt,
      }));

      res.json({
        success: true,
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      console.error('Failed to fetch public configs:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch configs' });
    }
  }

  // Auth: get my configs
  static async getMyConfigs(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    try {
      const configs = await prisma.customConfig.findMany({
        where: { userId: authReq.user!.id },
        orderBy: { updatedAt: 'desc' },
      });
      res.json({ success: true, data: configs });
    } catch (error) {
      console.error('Failed to fetch user configs:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch configs' });
    }
  }

  // Auth: create / save a config
  static async createConfig(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    try {
      const { title, selections, uploads, thumbnail, totalPrice, isPublic } = req.body;

      if (!title || !selections || totalPrice === undefined) {
        res.status(400).json({ success: false, error: 'title, selections, and totalPrice are required' });
        return;
      }

      const config = await prisma.customConfig.create({
        data: {
          title,
          selections,
          uploads: uploads || null,
          thumbnail: thumbnail || null,
          totalPrice,
          isPublic: isPublic ?? false,
          userId: authReq.user!.id,
        },
      });

      res.status(201).json({ success: true, data: config });
    } catch (error) {
      console.error('Failed to create config:', error);
      res.status(500).json({ success: false, error: 'Failed to create config' });
    }
  }

  // Auth: update a config (only own)
  static async updateConfig(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    try {
      const { id } = req.params;
      const existing = await prisma.customConfig.findUnique({ where: { id } });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Config not found' });
        return;
      }
      if (existing.userId !== authReq.user!.id) {
        res.status(403).json({ success: false, error: 'Not authorized' });
        return;
      }

      const { title, selections, uploads, thumbnail, totalPrice, isPublic } = req.body;
      const config = await prisma.customConfig.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(selections !== undefined && { selections }),
          ...(uploads !== undefined && { uploads }),
          ...(thumbnail !== undefined && { thumbnail }),
          ...(totalPrice !== undefined && { totalPrice }),
          ...(isPublic !== undefined && { isPublic }),
        },
      });

      res.json({ success: true, data: config });
    } catch (error) {
      console.error('Failed to update config:', error);
      res.status(500).json({ success: false, error: 'Failed to update config' });
    }
  }

  // Auth: delete a config (only own)
  static async deleteConfig(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    try {
      const { id } = req.params;
      const existing = await prisma.customConfig.findUnique({ where: { id } });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Config not found' });
        return;
      }
      if (existing.userId !== authReq.user!.id) {
        res.status(403).json({ success: false, error: 'Not authorized' });
        return;
      }

      // Delete related likes first, then the config
      await prisma.customConfigLike.deleteMany({ where: { configId: id } });
      await prisma.customConfig.delete({ where: { id } });

      res.json({ success: true, message: 'Config deleted' });
    } catch (error) {
      console.error('Failed to delete config:', error);
      res.status(500).json({ success: false, error: 'Failed to delete config' });
    }
  }

  // Auth: toggle like on a config
  static async toggleLike(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    try {
      const { id } = req.params;
      const userId = authReq.user!.id;

      const existing = await prisma.customConfigLike.findUnique({
        where: { configId_userId: { configId: id, userId } },
      });

      if (existing) {
        // Unlike
        await prisma.customConfigLike.delete({
          where: { configId_userId: { configId: id, userId } },
        });
        await prisma.customConfig.update({
          where: { id },
          data: { likes: { decrement: 1 } },
        });
        res.json({ success: true, data: { liked: false } });
      } else {
        // Like
        await prisma.customConfigLike.create({
          data: { configId: id, userId },
        });
        await prisma.customConfig.update({
          where: { id },
          data: { likes: { increment: 1 } },
        });
        res.json({ success: true, data: { liked: true } });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      res.status(500).json({ success: false, error: 'Failed to toggle like' });
    }
  }
}
