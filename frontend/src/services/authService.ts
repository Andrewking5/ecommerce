import api from './api';
import { setAccessToken, clearAccessToken } from './tokenManager';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  provider: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    if (data.success) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', registerData);
    if (data.success) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      clearAccessToken();
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    // refreshToken is sent automatically via HttpOnly cookie
    const { data } = await api.post<AuthResponse>('/auth/refresh', {});
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  },

  getGoogleAuthUrl(): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    return `${baseUrl}/auth/google`;
  },

  getFacebookAuthUrl(): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    return `${baseUrl}/auth/facebook`;
  },
};

export default authService;
