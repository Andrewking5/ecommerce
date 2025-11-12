import { apiClient } from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';

export const authApi = {
  // 用戶登入
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // 儲存 token
    if (response.success && response.accessToken) {
      apiClient.setToken(response.accessToken);
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  },

  // 用戶註冊
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    // 儲存 token
    if (response.success && response.accessToken) {
      apiClient.setToken(response.accessToken);
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  },

  // 刷新 Token
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    // 更新 token
    if (response.success && response.accessToken) {
      apiClient.setToken(response.accessToken);
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  },

  // 登出
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // 即使 API 呼叫失敗，也要清除本地 token
      console.error('Logout API error:', error);
    } finally {
      apiClient.clearToken();
    }
  },

  // 忘記密碼
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  // 重置密碼
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },

  // 獲取用戶資料
  getProfile: async (): Promise<{ success: boolean; user?: any; message?: string }> => {
    const response = await apiClient.get<any>('/users/profile');
    // 后端返回格式: { success: true, data: user }
    return {
      success: response.success || false,
      user: response.data || response.user,
      message: response.message,
    };
  },
};


