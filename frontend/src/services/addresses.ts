import { apiClient } from './api';
import { UserAddress, CreateAddressRequest, UpdateAddressRequest } from '@/types/address';

export const addressApi = {
  // 获取用户所有地址
  getUserAddresses: async (): Promise<UserAddress[]> => {
    const response = await apiClient.get<any>('/addresses');
    return response.data || response;
  },

  // 获取单个地址
  getAddressById: async (id: string): Promise<UserAddress> => {
    const response = await apiClient.get<any>(`/addresses/${id}`);
    return response.data || response;
  },

  // 获取默认地址
  getDefaultAddress: async (): Promise<UserAddress | null> => {
    try {
      const response = await apiClient.get<any>('/addresses/default');
      return response.data || response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // 创建地址
  createAddress: async (data: CreateAddressRequest): Promise<UserAddress> => {
    const response = await apiClient.post<any>('/addresses', data);
    return response.data || response;
  },

  // 更新地址
  updateAddress: async (id: string, data: UpdateAddressRequest): Promise<UserAddress> => {
    const response = await apiClient.put<any>(`/addresses/${id}`, data);
    return response.data || response;
  },

  // 删除地址
  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
  },

  // 设置默认地址
  setDefaultAddress: async (id: string): Promise<UserAddress> => {
    const response = await apiClient.put<any>(`/addresses/${id}/set-default`);
    return response.data || response;
  },
};

