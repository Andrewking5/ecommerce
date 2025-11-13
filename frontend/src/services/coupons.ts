import { apiClient } from './api';

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}

export const couponApi = {
  // 验证优惠券
  validateCoupon: async (code: string, amount: number): Promise<ValidateCouponResponse> => {
    try {
      const response = await apiClient.get<any>(`/coupons/${code}?amount=${amount}`);
      // 后端返回格式: { success: true, data: coupon }
      const coupon: Coupon = response.data || response;

      // 客户端验证
      const now = new Date();
      if (!coupon.isActive) {
        return {
          valid: false,
          message: 'Coupon is not active',
        };
      }

      if (now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) {
        return {
          valid: false,
          message: 'Coupon is not valid at this time',
        };
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return {
          valid: false,
          message: 'Coupon usage limit reached',
        };
      }

      if (coupon.minPurchase && amount < coupon.minPurchase) {
        return {
          valid: false,
          message: `Minimum purchase amount of $${coupon.minPurchase} required`,
        };
      }

      // 计算折扣
      let discountAmount = 0;
      if (coupon.type === 'PERCENTAGE') {
        discountAmount = (amount * coupon.value) / 100;
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      } else {
        discountAmount = coupon.value;
      }

      discountAmount = Math.min(discountAmount, amount);

      return {
        valid: true,
        coupon,
        discountAmount,
      };
    } catch (error: any) {
      return {
        valid: false,
        message: error.response?.data?.message || 'Invalid coupon code',
      };
    }
  },
};

