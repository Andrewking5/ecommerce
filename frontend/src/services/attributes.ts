import { apiClient } from './api';
import {
  ProductAttribute,
  ProductAttributeTemplate,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  CreateAttributeTemplateRequest,
  AttributeType,
} from '@/types/variant';

export const attributeApi = {
  // 獲取屬性列表
  getAttributes: async (params?: { categoryId?: string; type?: AttributeType }): Promise<ProductAttribute[]> => {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const response = await apiClient.get<any>(`/attributes${queryString ? `?${queryString}` : ''}`);
    return response.data || response;
  },

  // 獲取單個屬性
  getAttributeById: async (id: string): Promise<ProductAttribute> => {
    const response = await apiClient.get<any>(`/attributes/${id}`);
    return response.data || response;
  },

  // 創建屬性（管理員）
  createAttribute: async (data: CreateAttributeRequest): Promise<ProductAttribute> => {
    const response = await apiClient.post<any>('/attributes', data);
    return response.data || response;
  },

  // 更新屬性（管理員）
  updateAttribute: async (id: string, data: UpdateAttributeRequest): Promise<ProductAttribute> => {
    const response = await apiClient.put<any>(`/attributes/${id}`, data);
    return response.data || response;
  },

  // 刪除屬性（管理員）
  deleteAttribute: async (id: string): Promise<void> => {
    await apiClient.delete(`/attributes/${id}`);
  },

  // 獲取屬性模板列表
  getAttributeTemplates: async (params?: { categoryId?: string; isDefault?: boolean }): Promise<ProductAttributeTemplate[]> => {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.isDefault !== undefined) queryParams.append('isDefault', params.isDefault.toString());

    const queryString = queryParams.toString();
    const response = await apiClient.get<any>(`/attributes/templates/list${queryString ? `?${queryString}` : ''}`);
    return response.data || response;
  },

  // 獲取單個屬性模板
  getAttributeTemplateById: async (id: string): Promise<ProductAttributeTemplate> => {
    const response = await apiClient.get<any>(`/attributes/templates/${id}`);
    return response.data || response;
  },

  // 創建屬性模板（管理員）
  createAttributeTemplate: async (data: CreateAttributeTemplateRequest): Promise<ProductAttributeTemplate> => {
    const response = await apiClient.post<any>('/attributes/templates', data);
    return response.data || response;
  },

  // 更新屬性模板（管理員）
  updateAttributeTemplate: async (id: string, data: Partial<CreateAttributeTemplateRequest>): Promise<ProductAttributeTemplate> => {
    const response = await apiClient.put<any>(`/attributes/templates/${id}`, data);
    return response.data || response;
  },

  // 刪除屬性模板（管理員）
  deleteAttributeTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/attributes/templates/${id}`);
  },
};

