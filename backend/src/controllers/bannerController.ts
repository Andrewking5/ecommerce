import { Request, Response } from 'express';
import { prisma } from '../app';

export class BannerController {
  // Public: get active banners (optional ?placement=home|collections)
  static async getActiveBanners(req: Request, res: Response): Promise<void> {
    try {
      const placement = req.query.placement as string | undefined;
      const banners = await prisma.homeBanner.findMany({
        where: {
          isActive: true,
          ...(placement ? { placement } : {}),
        },
        orderBy: { displayOrder: 'asc' },
      });
      res.json({ success: true, data: banners });
    } catch (error) {
      console.error('Failed to fetch active banners:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch banners' });
    }
  }

  // Admin: get all banners (including inactive)
  static async getAllBanners(req: Request, res: Response): Promise<void> {
    try {
      const banners = await prisma.homeBanner.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      res.json({ success: true, data: banners });
    } catch (error) {
      console.error('Failed to fetch all banners:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch banners' });
    }
  }

  // Admin: get banner by ID
  static async getBannerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const banner = await prisma.homeBanner.findUnique({
        where: { id },
      });

      if (!banner) {
        res.status(404).json({ success: false, error: 'Banner not found' });
        return;
      }

      res.json({ success: true, data: banner });
    } catch (error) {
      console.error('Failed to fetch banner:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch banner' });
    }
  }

  // Admin: create banner
  static async createBanner(req: Request, res: Response): Promise<void> {
    try {
      const {
        slug,
        placement,
        subtitle,
        titleWord1,
        titleWord2,
        titleColor1,
        titleColor2,
        body,
        ctaLabel,
        ctaLink,
        image,
        productImage,
        gradientColor,
        displayOrder,
        isActive,
      } = req.body;

      // Check for duplicate slug
      const existing = await prisma.homeBanner.findUnique({
        where: { slug },
      });
      if (existing) {
        res.status(409).json({ success: false, error: 'A banner with this slug already exists' });
        return;
      }

      const banner = await prisma.homeBanner.create({
        data: {
          slug,
          placement: placement ?? 'home',
          subtitle,
          titleWord1,
          titleWord2,
          titleColor1,
          titleColor2,
          body,
          ctaLabel,
          ctaLink,
          image,
          productImage: productImage ?? null,
          gradientColor: gradientColor ?? '#1a1a1a',
          displayOrder: displayOrder ?? 0,
          isActive: isActive ?? true,
        },
      });

      res.status(201).json({ success: true, data: banner });
    } catch (error) {
      console.error('Failed to create banner:', error);
      res.status(500).json({ success: false, error: 'Failed to create banner' });
    }
  }

  // Admin: update banner
  static async updateBanner(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        slug,
        placement,
        subtitle,
        titleWord1,
        titleWord2,
        titleColor1,
        titleColor2,
        body,
        ctaLabel,
        ctaLink,
        image,
        productImage,
        gradientColor,
        displayOrder,
        isActive,
      } = req.body;

      // Verify banner exists
      const existing = await prisma.homeBanner.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Banner not found' });
        return;
      }

      // Check slug uniqueness if changing slug
      if (slug && slug !== existing.slug) {
        const slugExists = await prisma.homeBanner.findUnique({ where: { slug } });
        if (slugExists) {
          res.status(409).json({ success: false, error: 'A banner with this slug already exists' });
          return;
        }
      }

      const banner = await prisma.homeBanner.update({
        where: { id },
        data: {
          ...(slug !== undefined && { slug }),
          ...(placement !== undefined && { placement }),
          ...(subtitle !== undefined && { subtitle }),
          ...(titleWord1 !== undefined && { titleWord1 }),
          ...(titleWord2 !== undefined && { titleWord2 }),
          ...(titleColor1 !== undefined && { titleColor1 }),
          ...(titleColor2 !== undefined && { titleColor2 }),
          ...(body !== undefined && { body }),
          ...(ctaLabel !== undefined && { ctaLabel }),
          ...(ctaLink !== undefined && { ctaLink }),
          ...(image !== undefined && { image }),
          ...(productImage !== undefined && { productImage }),
          ...(gradientColor !== undefined && { gradientColor }),
          ...(displayOrder !== undefined && { displayOrder }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({ success: true, data: banner });
    } catch (error) {
      console.error('Failed to update banner:', error);
      res.status(500).json({ success: false, error: 'Failed to update banner' });
    }
  }

  // Admin: delete banner
  static async deleteBanner(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await prisma.homeBanner.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Banner not found' });
        return;
      }

      await prisma.homeBanner.delete({ where: { id } });

      res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
      console.error('Failed to delete banner:', error);
      res.status(500).json({ success: false, error: 'Failed to delete banner' });
    }
  }

  // Admin: toggle banner active status
  static async toggleBanner(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await prisma.homeBanner.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Banner not found' });
        return;
      }

      const banner = await prisma.homeBanner.update({
        where: { id },
        data: { isActive: !existing.isActive },
      });

      res.json({ success: true, data: banner });
    } catch (error) {
      console.error('Failed to toggle banner:', error);
      res.status(500).json({ success: false, error: 'Failed to toggle banner' });
    }
  }

  // Admin: reorder banners
  static async reorderBanners(req: Request, res: Response): Promise<void> {
    try {
      const { orders } = req.body;
      // orders is an array of { id: string, displayOrder: number }

      await prisma.$transaction(
        orders.map((item: { id: string; displayOrder: number }) =>
          prisma.homeBanner.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          })
        )
      );

      const banners = await prisma.homeBanner.findMany({
        orderBy: { displayOrder: 'asc' },
      });

      res.json({ success: true, data: banners });
    } catch (error) {
      console.error('Failed to reorder banners:', error);
      res.status(500).json({ success: false, error: 'Failed to reorder banners' });
    }
  }
}
