import { apiClient } from './api';
import { User } from '@/types/auth';

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  isActive?: boolean;
  preferredLanguage?: string;
}

export interface UpdateLanguageRequest {
  preferredLanguage: string;
}

export const userApi = {
  // 获取所有用户（管理员）
  getAllUsers: async (page: number = 1, limit: number = 20, role?: string): Promise<UserListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (role) {
      params.append('role', role);
    }

    const response = await apiClient.get<any>(`/users?${params}`);
    // 后端返回格式: { success: true, data: { users, pagination } }
    return response.data || response;
  },

  // 获取单个用户（管理员）
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<any>(`/users/${id}`);
    // 后端返回格式: { success: true, data: user }
    return response.data || response;
  },

  // 更新用户（管理员）
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<any>(`/users/${id}`, data);
    // 后端返回格式: { success: true, data: user }
    return response.data || response;
  },

  // 删除用户（管理员）
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // 更新用户语言偏好
  updateLanguage: async (data: UpdateLanguageRequest): Promise<{ preferredLanguage: string }> => {
    const response = await apiClient.put<any>('/users/language', data);
    return response.data || response;
  },
};

// 导出为 usersApi 以保持一致性
export const usersApi = userApi;

