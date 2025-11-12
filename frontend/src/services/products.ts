import { apiClient } from './api';
import { Product, ProductQueryParams, ProductListResponse, Category } from '@/types/product';

export const productApi = {
  // 獲取商品列表
  getProducts: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<any>(`/products?${queryParams}`);
    // 后端返回格式: { success: true, data: { products, pagination } }
    // apiClient.get 已经返回了 response.data，所以 response 就是 { success: true, data: { products, pagination } }
    if (response.success && response.data) {
      return response.data; // 返回 { products, pagination }
    }
    // 兼容旧格式或错误情况
    return response.data || response;
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
};


