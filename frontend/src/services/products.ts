import { apiClient } from './api';
import { Product, ProductQueryParams, ProductListResponse, Category } from '@/types/product';

export const productApi = {
  // 獲取商品列表
  getProducts: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // 处理布尔值
          if (typeof value === 'boolean') {
            queryParams.append(key, value.toString());
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const response = await apiClient.get<any>(`/products${queryString ? `?${queryString}` : ''}`);
    // 后端返回格式: { success: true, data: { products, pagination } }
    // apiClient.get 返回 response.data，所以 response 就是 { success: true, data: { products, pagination } }
    
    // 检查响应格式
    if (response && typeof response === 'object') {
      if (response.success && response.data) {
        // 标准格式: { success: true, data: { products, pagination } }
        return response.data;
      }
      if (response.products && response.pagination) {
        // 直接格式: { products, pagination }
        return response;
      }
      if (response.data) {
        // 只有 data: { products, pagination }
        return response.data;
      }
    }
    
    // 兼容旧格式或错误情况
    return response;
  },

  // 獲取單一商品
  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<any>(`/products/${id}`);
    // 后端返回格式: { success: true, data: product }
    return response.data || response;
  },

  // 搜尋商品
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await apiClient.get<any>(`/products/search?q=${encodeURIComponent(query)}`);
    // 后端返回格式: { success: true, data: products[] }
    return response.data || response;
  },

  // 獲取商品分類
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<any>('/products/categories');
    // 后端返回格式: { success: true, data: categories[] }
    return response.data || response;
  },

  // 創建商品（管理員）
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post<any>('/products', data);
    // 后端返回格式: { success: true, data: product }
    return response.data || response;
  },

  // 更新商品（管理員）
  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put<any>(`/products/${id}`, data);
    // 后端返回格式: { success: true, data: product }
    return response.data || response;
  },

  // 刪除商品（管理員）
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  // 批量創建商品（管理員）
  createProductsBulk: async (products: Partial<Product>[]): Promise<{
    success: Product[];
    failed: Array<{ index: number; data: any; error: string }>;
    summary: { total: number; success: number; failed: number };
  }> => {
    const response = await apiClient.post<any>('/products/bulk', { products });
    return response.data || response;
  },

  // 獲取已刪除的商品列表（垃圾桶）
  getDeletedProducts: async (params?: { page?: number; limit?: number; search?: string }): Promise<ProductListResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const response = await apiClient.get<any>(`/products/admin/trash${queryString ? `?${queryString}` : ''}`);
    return response.data || response;
  },

  // 恢復商品（從垃圾桶恢復）
  restoreProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.post<any>(`/products/${id}/restore`);
    return response.data || response;
  },

  // 永久刪除商品（從數據庫中真正刪除）
  permanentlyDeleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}/permanent`);
  },
};


