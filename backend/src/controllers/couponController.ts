import { Request, Response } from 'express';
import { prisma } from '../app';
import { Decimal } from '@prisma/client/runtime/library';

export class CouponController {
  /**
   * 验证优惠券
   * GET /api/coupons/:code
   */
  static async validateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const { amount } = req.query;

      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!coupon) {
        res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
        return;
      }

      // 验证优惠券
      const now = new Date();
      if (!coupon.isActive) {
        res.status(400).json({
          success: false,
          message: 'Coupon is not active',
        });
        return;
      }

      if (now < coupon.validFrom || now > coupon.validUntil) {
        res.status(400).json({
          success: false,
          message: 'Coupon is not valid at this time',
        });
        return;
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        res.status(400).json({
          success: false,
          message: 'Coupon usage limit reached',
        });
        return;
      }

      const purchaseAmount = amount ? Number(amount) : 0;
      if (coupon.minPurchase && purchaseAmount < Number(coupon.minPurchase)) {
        res.status(400).json({
          success: false,
          message: `Minimum purchase amount of $${coupon.minPurchase} required`,
        });
        return;
      }

      res.json({
        success: true,
        data: coupon,
      });
      return;
    } catch (error) {
      console.error('Validate coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 获取所有优惠券（管理员）
   * GET /api/admin/coupons
   */
  static async getAllCoupons(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        isActive,
        search,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      if (search) {
        where.OR = [
          { code: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [coupons, total] = await Promise.all([
        prisma.coupon.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.coupon.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          coupons,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
      return;
    } catch (error) {
      console.error('Get all coupons error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 获取优惠券详情（管理员）
   * GET /api/admin/coupons/:id
   */
  static async getCouponById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const coupon = await prisma.coupon.findUnique({
        where: { id },
      });

      if (!coupon) {
        res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
        return;
      }

      res.json({
        success: true,
        data: coupon,
      });
      return;
    } catch (error) {
      console.error('Get coupon by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 创建优惠券（管理员）
   * POST /api/admin/coupons
   */
  static async createCoupon(req: Request, res: Response): Promise<void> {
    try {
      const {
        code,
        type,
        value,
        minPurchase,
        maxDiscount,
        usageLimit,
        validFrom,
        validUntil,
        isActive = true,
      } = req.body;

      // 检查优惠码是否已存在
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (existingCoupon) {
        res.status(400).json({
          success: false,
          message: 'Coupon code already exists',
        });
        return;
      }

      const coupon = await prisma.coupon.create({
        data: {
          code: code.toUpperCase(),
          type,
          value: new Decimal(value),
          minPurchase: minPurchase ? new Decimal(minPurchase) : null,
          maxDiscount: maxDiscount ? new Decimal(maxDiscount) : null,
          usageLimit: usageLimit || null,
          validFrom: new Date(validFrom),
          validUntil: new Date(validUntil),
          isActive,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
      });
      return;
    } catch (error) {
      console.error('Create coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 更新优惠券（管理员）
   * PUT /api/admin/coupons/:id
   */
  static async updateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        code,
        type,
        value,
        minPurchase,
        maxDiscount,
        usageLimit,
        validFrom,
        validUntil,
        isActive,
      } = req.body;

      // 如果更新code，检查是否已存在
      if (code) {
        const existingCoupon = await prisma.coupon.findFirst({
          where: {
            code: code.toUpperCase(),
            NOT: { id },
          },
        });

        if (existingCoupon) {
          res.status(400).json({
            success: false,
            message: 'Coupon code already exists',
          });
          return;
        }
      }

      const updateData: any = {};

      if (code) updateData.code = code.toUpperCase();
      if (type) updateData.type = type;
      if (value !== undefined) updateData.value = new Decimal(value);
      if (minPurchase !== undefined) {
        updateData.minPurchase = minPurchase ? new Decimal(minPurchase) : null;
      }
      if (maxDiscount !== undefined) {
        updateData.maxDiscount = maxDiscount ? new Decimal(maxDiscount) : null;
      }
      if (usageLimit !== undefined) updateData.usageLimit = usageLimit || null;
      if (validFrom) updateData.validFrom = new Date(validFrom);
      if (validUntil) updateData.validUntil = new Date(validUntil);
      if (isActive !== undefined) updateData.isActive = isActive;

      const coupon = await prisma.coupon.update({
        where: { id },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon,
      });
      return;
    } catch (error) {
      console.error('Update coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 删除优惠券（管理员）
   * DELETE /api/admin/coupons/:id
   */
  static async deleteCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.coupon.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Coupon deleted successfully',
      });
      return;
    } catch (error) {
      console.error('Delete coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 获取优惠券使用记录（管理员）
   * GET /api/admin/coupons/:id/usage
   */
  static async getCouponUsage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const coupon = await prisma.coupon.findUnique({
        where: { id },
      });

      if (!coupon) {
        res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
        return;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { couponCode: coupon.code },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
        prisma.order.count({ where: { couponCode: coupon.code } }),
      ]);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
      return;
    } catch (error) {
      console.error('Get coupon usage error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 获取优惠券统计（管理员）
   * GET /api/admin/coupons/:id/stats
   */
  static async getCouponStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const coupon = await prisma.coupon.findUnique({
        where: { id },
      });

      if (!coupon) {
        res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
        return;
      }

      const [totalOrders, totalDiscount] = await Promise.all([
        prisma.order.count({
          where: { couponCode: coupon.code },
        }),
        prisma.order.aggregate({
          where: { couponCode: coupon.code },
          _sum: { discountAmount: true },
        }),
      ]);

      const usageRate =
        coupon.usageLimit && coupon.usageLimit > 0
          ? ((coupon.usedCount / coupon.usageLimit) * 100).toFixed(2)
          : null;

      res.json({
        success: true,
        data: {
          totalOrders,
          totalDiscount: totalDiscount._sum.discountAmount || 0,
          usedCount: coupon.usedCount,
          usageLimit: coupon.usageLimit,
          usageRate,
        },
      });
      return;
    } catch (error) {
      console.error('Get coupon stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 批量操作优惠券（管理员）
   * POST /api/admin/coupons/bulk-action
   */
  static async bulkAction(req: Request, res: Response): Promise<void> {
    try {
      const { action, couponIds } = req.body;

      if (!Array.isArray(couponIds) || couponIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Coupon IDs are required',
        });
        return;
      }

      let updateData: any = {};

      switch (action) {
        case 'activate':
          updateData.isActive = true;
          break;
        case 'deactivate':
          updateData.isActive = false;
          break;
        default:
          res.status(400).json({
            success: false,
            message: 'Invalid action',
          });
          return;
      }

      const result = await prisma.coupon.updateMany({
        where: { id: { in: couponIds } },
        data: updateData,
      });

      res.json({
        success: true,
        message: `${result.count} coupons updated successfully`,
        data: { count: result.count },
      });
      return;
    } catch (error) {
      console.error('Bulk action error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }
}

