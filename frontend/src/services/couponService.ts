import api from './api';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}

export interface CouponsResponse {
  success: boolean;
  data: {
    coupons: Coupon[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CouponUsage {
  success: boolean;
  data: {
    totalUses: number;
    usages: Array<{
      id: string;
      orderId: string;
      userId: string;
      usedAt: string;
    }>;
  };
}

export interface CouponStats {
  success: boolean;
  data: {
    totalUses: number;
    totalDiscount: number;
    averageDiscount: number;
  };
}

const couponService = {
  // ── Public ──
  async validateCoupon(code: string, orderTotal?: number): Promise<{ success: boolean; data: CouponValidation }> {
    const { data } = await api.get(`/coupons/${encodeURIComponent(code)}`, {
      params: orderTotal ? { orderTotal } : undefined,
    });
    return data;
  },

  // ── Admin ──
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<CouponsResponse> {
    const { data } = await api.get<CouponsResponse>('/coupons/admin/coupons', { params });
    return data;
  },

  async getById(id: string): Promise<{ success: boolean; data: Coupon }> {
    const { data } = await api.get(`/coupons/admin/coupons/${id}`);
    return data;
  },

  async create(coupon: Partial<Coupon>): Promise<{ success: boolean; data: Coupon }> {
    const { data } = await api.post('/coupons/admin/coupons', coupon);
    return data;
  },

  async update(id: string, updates: Partial<Coupon>): Promise<{ success: boolean; data: Coupon }> {
    const { data } = await api.put(`/coupons/admin/coupons/${id}`, updates);
    return data;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/coupons/admin/coupons/${id}`);
    return data;
  },

  async getUsage(id: string): Promise<CouponUsage> {
    const { data } = await api.get(`/coupons/admin/coupons/${id}/usage`);
    return data;
  },

  async getStats(id: string): Promise<CouponStats> {
    const { data } = await api.get(`/coupons/admin/coupons/${id}/stats`);
    return data;
  },

  async bulkAction(action: string, ids: string[]): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/coupons/admin/coupons/bulk-action', { action, ids });
    return data;
  },
};

export default couponService;
