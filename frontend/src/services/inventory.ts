import { apiClient } from './api';
import { Product } from '@/types/product';

export interface InventoryStats {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalStockValue: number;
  threshold: number;
}

export interface LowStockProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  threshold: number;
}

export const inventoryApi = {
  // 获取低库存商品
  getLowStockProducts: async (
    threshold: number = 10,
    page: number = 1,
    limit: number = 20
  ): Promise<LowStockProductsResponse> => {
    const response = await apiClient.get<any>('/admin/inventory/low-stock', {
      params: { threshold, page, limit },
    });
    return response.data || response;
  },

  // 获取库存统计
  getInventoryStats: async (threshold: number = 10): Promise<InventoryStats> => {
    const response = await apiClient.get<any>('/admin/inventory/stats', {
      params: { threshold },
    });
    return response.data || response;
  },

  // 批量更新库存
  bulkUpdateStock: async (updates: Array<{ productId: string; stock: number }>): Promise<void> => {
    await apiClient.post('/admin/inventory/bulk-update', { updates });
  },

  // 快速调整库存
  quickAdjustStock: async (
    productId: string,
    data: { adjustment?: number; newStock?: number }
  ): Promise<Product> => {
    const response = await apiClient.put<any>(`/admin/inventory/${productId}/adjust`, data);
    return response.data || response;
  },
};

