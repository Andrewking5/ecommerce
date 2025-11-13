import { Request, Response } from 'express';
import { prisma } from '../app';

export class ReviewController {
  /**
   * 创建评论
   * POST /api/reviews
   */
  static async createReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { productId, rating, comment, images } = req.body;

      // 验证评分
      if (rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
        return;
      }

      // 检查是否已评论过
      const existingReview = await prisma.review.findUnique({
        where: {
          productId_userId: {
            productId,
            userId,
          },
        },
      });

      if (existingReview) {
        res.status(400).json({
          success: false,
          message: 'You have already reviewed this product',
        });
        return;
      }

      // 验证用户是否购买过该商品
      const hasPurchased = await prisma.order.findFirst({
        where: {
          userId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          orderItems: {
            some: {
              productId,
            },
          },
        },
      });

      const review = await prisma.review.create({
        data: {
          productId,
          userId,
          rating,
          comment: comment || null,
          images: images || [],
          isVerified: !!hasPurchased,
          isApproved: false, // 新评论需要管理员审核
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Review created successfully. It will be visible after approval.',
        data: review,
      });
      return;
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 获取商品评论
   * GET /api/reviews/product/:productId
   */
  static async getProductReviews(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, rating, sortBy = 'createdAt' } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {
        productId,
        isApproved: true, // 只返回已审核的评论
      };

      if (rating) {
        where.rating = Number(rating);
      }

      const orderBy: any = {};
      if (sortBy === 'rating') {
        orderBy.rating = 'desc';
      } else if (sortBy === 'helpful') {
        orderBy.helpfulCount = 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        }),
        prisma.review.count({ where }),
      ]);

      // 计算平均评分
      const avgRating = await prisma.review.aggregate({
        where: {
          productId,
          isApproved: true,
        },
        _avg: {
          rating: true,
        },
      });

      // 评分分布
      const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: {
          productId,
          isApproved: true,
        },
        _count: {
          rating: true,
        },
      });

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
          stats: {
            averageRating: avgRating._avg.rating || 0,
            totalReviews: total,
            ratingDistribution: ratingDistribution.reduce((acc, item) => {
              acc[item.rating] = item._count.rating;
              return acc;
            }, {} as Record<number, number>),
          },
        },
      });
      return;
    } catch (error) {
      console.error('Get product reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 更新评论
   * PUT /api/reviews/:id
   */
  static async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { rating, comment, images } = req.body;

      // 检查评论是否存在且属于当前用户
      const review = await prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found',
        });
        return;
      }

      if (review.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'You can only update your own reviews',
        });
        return;
      }

      const updateData: any = {};
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5',
          });
          return;
        }
        updateData.rating = rating;
      }
      if (comment !== undefined) updateData.comment = comment;
      if (images !== undefined) updateData.images = images;
      updateData.isApproved = false; // 更新后需要重新审核

      const updatedReview = await prisma.review.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Review updated successfully. It will be visible after approval.',
        data: updatedReview,
      });
      return;
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 删除评论
   * DELETE /api/reviews/:id
   */
  static async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // 检查评论是否存在且属于当前用户
      const review = await prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found',
        });
        return;
      }

      if (review.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'You can only delete your own reviews',
        });
        return;
      }

      await prisma.review.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Review deleted successfully',
      });
      return;
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 标记评论为有用
   * POST /api/reviews/:id/helpful
   */
  static async markHelpful(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const review = await prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found',
        });
        return;
      }

      const updatedReview = await prisma.review.update({
        where: { id },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      });

      res.json({
        success: true,
        data: updatedReview,
      });
      return;
    } catch (error) {
      console.error('Mark helpful error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 获取所有评论（管理员）
   * GET /api/admin/reviews
   */
  static async getAllReviews(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        productId,
        userId,
        rating,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (status === 'pending') {
        where.isApproved = false;
      } else if (status === 'approved') {
        where.isApproved = true;
      } else if (status === 'rejected') {
        // 这里可以添加rejected状态，目前使用isApproved=false表示待审核
        where.isApproved = false;
      }

      if (productId) {
        where.productId = productId;
      }

      if (userId) {
        where.userId = userId;
      }

      if (rating) {
        where.rating = Number(rating);
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
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
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        }),
        prisma.review.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          reviews,
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
      console.error('Get all reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 获取评论详情（管理员）
   * GET /api/admin/reviews/:id
   */
  static async getReviewById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      });

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found',
        });
        return;
      }

      res.json({
        success: true,
        data: review,
      });
      return;
    } catch (error) {
      console.error('Get review by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 审核通过评论（管理员）
   * PUT /api/admin/reviews/:id/approve
   */
  static async approveReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const review = await prisma.review.update({
        where: { id },
        data: {
          isApproved: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Review approved successfully',
        data: review,
      });
      return;
    } catch (error) {
      console.error('Approve review error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 拒绝评论（管理员）
   * PUT /api/admin/reviews/:id/reject
   */
  static async rejectReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // 删除被拒绝的评论
      await prisma.review.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Review rejected and deleted successfully',
      });
      return;
    } catch (error) {
      console.error('Reject review error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 批量审核评论（管理员）
   * POST /api/admin/reviews/bulk-approve
   */
  static async bulkApprove(req: Request, res: Response): Promise<void> {
    try {
      const { reviewIds, action } = req.body;

      if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Review IDs are required',
        });
        return;
      }

      if (action === 'approve') {
        const result = await prisma.review.updateMany({
          where: { id: { in: reviewIds } },
          data: { isApproved: true },
        });

        res.json({
          success: true,
          message: `${result.count} reviews approved successfully`,
          data: { count: result.count },
        });
      } else if (action === 'delete') {
        const result = await prisma.review.deleteMany({
          where: { id: { in: reviewIds } },
        });

        res.json({
          success: true,
          message: `${result.count} reviews deleted successfully`,
          data: { count: result.count },
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid action',
        });
      }
      return;
    } catch (error) {
      console.error('Bulk approve error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 获取评论统计（管理员）
   * GET /api/admin/reviews/stats
   */
  static async getReviewStats(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.query;

      const where: any = {};
      if (productId) {
        where.productId = productId as string;
      }

      const [
        totalReviews,
        approvedReviews,
        pendingReviews,
        avgRating,
        ratingDistribution,
      ] = await Promise.all([
        prisma.review.count({ where }),
        prisma.review.count({ where: { ...where, isApproved: true } }),
        prisma.review.count({ where: { ...where, isApproved: false } }),
        prisma.review.aggregate({
          where: { ...where, isApproved: true },
          _avg: { rating: true },
        }),
        prisma.review.groupBy({
          by: ['rating'],
          where: { ...where, isApproved: true },
          _count: { rating: true },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalReviews,
          approvedReviews,
          pendingReviews,
          averageRating: avgRating._avg.rating || 0,
          ratingDistribution: ratingDistribution.reduce((acc, item) => {
            acc[item.rating] = item._count.rating;
            return acc;
          }, {} as Record<number, number>),
        },
      });
      return;
    } catch (error) {
      console.error('Get review stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }
}

