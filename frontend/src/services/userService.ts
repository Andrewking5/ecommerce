import api from './api';
import { User } from './authService';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

const userService = {
  async getProfile(): Promise<{ success: boolean; user: User }> {
    const { data } = await api.get('/users/profile');
    return data;
  },

  async updateProfile(profileData: UpdateProfileData): Promise<{ success: boolean; user: User; message: string }> {
    const { data } = await api.put('/users/profile', profileData);
    return data;
  },

  async changePassword(passwordData: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    const { data } = await api.put('/users/password', passwordData);
    return data;
  },

  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<{
    success: boolean;
    data: { users: User[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
  }> {
    const { data } = await api.get('/users', { params });
    return data;
  },

  async getUserById(id: string): Promise<{ success: boolean; user: User }> {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  // ── Admin ──
  async updateUser(id: string, updates: Partial<User>): Promise<{ success: boolean; user: User }> {
    const { data } = await api.put(`/users/${id}`, updates);
    return data;
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};

export default userService;
