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
    return response.data || response;
  },

  // 獲取單一商品
  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data || response;
  },

  // 搜尋商品
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data || response;
  },

  // 獲取商品分類
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/products/categories');
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


