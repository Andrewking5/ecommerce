import { apiClient } from './api';
import { Category } from '@/types/product';

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export interface CategoryWithCount extends Category {
  productCount?: number;
}

export const categoryApi = {
  // 獲取分類列表
  getCategories: async (includeInactive?: boolean): Promise<CategoryWithCount[]> => {
    const response = await apiClient.get<any>('/admin/categories', {
      params: includeInactive ? { includeInactive: 'true' } : {},
    });
    return response.data || response;
  },

  // 獲取單一分類
  getCategoryById: async (id: string): Promise<CategoryWithCount> => {
    const response = await apiClient.get<any>(`/admin/categories/${id}`);
    return response.data || response;
  },

  // 創建分類
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post<any>('/admin/categories', data);
    return response.data || response;
  },

  // 更新分類
  updateCategory: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const response = await apiClient.put<any>(`/admin/categories/${id}`, data);
    return response.data || response;
  },

  // 刪除分類
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },
};

