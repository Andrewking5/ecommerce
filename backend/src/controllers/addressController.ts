import { Request, Response } from 'express';
import { prisma } from '../app';

export class AddressController {
  /**
   * 获取用户所有地址
   * GET /api/addresses
   */
  static async getUserAddresses(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const addresses = await prisma.userAddress.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' }, // 默认地址排在前面
          { createdAt: 'desc' },
        ],
      });

      res.json({
        success: true,
        data: addresses,
      });
      return;
    } catch (error) {
      console.error('Get user addresses error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 获取单个地址
   * GET /api/addresses/:id
   */
  static async getAddressById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const address = await prisma.userAddress.findFirst({
        where: {
          id,
          userId, // 确保只能获取自己的地址
        },
      });

      if (!address) {
        res.status(404).json({
          success: false,
          message: 'Address not found',
        });
        return;
      }

      res.json({
        success: true,
        data: address,
      });
      return;
    } catch (error) {
      console.error('Get address by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 创建新地址
   * POST /api/addresses
   */
  static async createAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const {
        recipientName,
        phone,
        province,
        city,
        district,
        street,
        zipCode,
        label,
        isDefault,
      } = req.body;

      // 如果设置为默认地址，先取消其他默认地址
      if (isDefault) {
        await prisma.userAddress.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      const address = await prisma.userAddress.create({
        data: {
          userId,
          recipientName,
          phone,
          province,
          city,
          district,
          street,
          zipCode: zipCode || null,
          label: label || null,
          isDefault: isDefault || false,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Address created successfully',
        data: address,
      });
      return;
    } catch (error) {
      console.error('Create address error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 更新地址
   * PUT /api/addresses/:id
   */
  static async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const {
        recipientName,
        phone,
        province,
        city,
        district,
        street,
        zipCode,
        label,
        isDefault,
      } = req.body;

      // 检查地址是否存在且属于当前用户
      const existingAddress = await prisma.userAddress.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingAddress) {
        res.status(404).json({
          success: false,
          message: 'Address not found',
        });
        return;
      }

      // 如果设置为默认地址，先取消其他默认地址
      if (isDefault && !existingAddress.isDefault) {
        await prisma.userAddress.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      const address = await prisma.userAddress.update({
        where: { id },
        data: {
          recipientName,
          phone,
          province,
          city,
          district,
          street,
          zipCode: zipCode !== undefined ? zipCode : null,
          label: label !== undefined ? label : null,
          isDefault: isDefault !== undefined ? isDefault : existingAddress.isDefault,
        },
      });

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: address,
      });
      return;
    } catch (error) {
      console.error('Update address error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 删除地址
   * DELETE /api/addresses/:id
   */
  static async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // 检查地址是否存在且属于当前用户
      const address = await prisma.userAddress.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!address) {
        res.status(404).json({
          success: false,
          message: 'Address not found',
        });
        return;
      }

      await prisma.userAddress.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Address deleted successfully',
      });
      return;
    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 设置默认地址
   * PUT /api/addresses/:id/set-default
   */
  static async setDefaultAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // 检查地址是否存在且属于当前用户
      const address = await prisma.userAddress.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!address) {
        res.status(404).json({
          success: false,
          message: 'Address not found',
        });
        return;
      }

      // 先取消所有默认地址
      await prisma.userAddress.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      // 设置当前地址为默认
      const updatedAddress = await prisma.userAddress.update({
        where: { id },
        data: {
          isDefault: true,
        },
      });

      res.json({
        success: true,
        message: 'Default address set successfully',
        data: updatedAddress,
      });
      return;
    } catch (error) {
      console.error('Set default address error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }

  /**
   * 获取默认地址
   * GET /api/addresses/default
   */
  static async getDefaultAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const address = await prisma.userAddress.findFirst({
        where: {
          userId,
          isDefault: true,
        },
      });

      if (!address) {
        res.status(404).json({
          success: false,
          message: 'No default address found',
        });
        return;
      }

      res.json({
        success: true,
        data: address,
      });
      return;
    } catch (error) {
      console.error('Get default address error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
      return;
    }
  }
}

