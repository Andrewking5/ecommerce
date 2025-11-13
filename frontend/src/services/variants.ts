import { apiClient } from './api';
import {
  ProductVariant,
  CreateVariantRequest,
  UpdateVariantRequest,
  CreateVariantsBulkRequest,
  GenerateSKURequest,
} from '@/types/variant';

export const variantApi = {
  // 獲取商品的所有變體
  getProductVariants: async (productId: string, params?: { isActive?: boolean }): Promise<ProductVariant[]> => {
    const queryParams = new URLSearchParams();
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const queryString = queryParams.toString();
    const response = await apiClient.get<any>(`/variants/product/${productId}${queryString ? `?${queryString}` : ''}`);
    // 处理响应格式
    if (response && typeof response === 'object') {
      if (response.success && response.data) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    return [];
  },

  // 獲取單個變體
  getVariantById: async (id: string): Promise<ProductVariant> => {
    const response = await apiClient.get<any>(`/variants/${id}`);
    return response.data || response;
  },

  // 創建變體（管理員）
  createVariant: async (data: CreateVariantRequest): Promise<ProductVariant> => {
    const response = await apiClient.post<any>('/variants', data);
    return response.data || response;
  },

  // 批量創建變體（管理員）
  createVariantsBulk: async (data: CreateVariantsBulkRequest): Promise<{ data: ProductVariant[]; count: number }> => {
    const response = await apiClient.post<any>('/variants/bulk', data);
    return response.data || response;
  },

  // 更新變體（管理員）
  updateVariant: async (id: string, data: UpdateVariantRequest): Promise<ProductVariant> => {
    const response = await apiClient.put<any>(`/variants/${id}`, data);
    return response.data || response;
  },

  // 批量更新變體（管理員）
  updateVariantsBulk: async (variantIds: string[], data: { price?: number; stock?: number; isActive?: boolean }): Promise<{ message: string; count: number }> => {
    const response = await apiClient.put<any>('/variants/bulk/update', { variantIds, data });
    return response.data || response;
  },

  // 刪除變體（管理員）
  deleteVariant: async (id: string): Promise<void> => {
    await apiClient.delete(`/variants/${id}`);
  },

  // 生成 SKU
  generateSKU: async (data: GenerateSKURequest): Promise<{ sku: string }> => {
    const response = await apiClient.post<any>('/variants/generate-sku', data);
    return response.data || response;
  },

  // 更新变体顺序
  updateVariantsOrder: async (variantIds: string[]): Promise<{ message: string }> => {
    const response = await apiClient.put<any>('/variants/update-order', { variantIds });
    return response.data || response;
  },
};

