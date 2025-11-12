import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types/auth';
import { authApi } from '@/services/auth';
import { apiClient } from '@/services/api';
import toast from 'react-hot-toast';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  refreshAuthToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          
          if (response.success) {
            set({
              user: response.user,
              token: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
            // Toast message will be translated in the component
            toast.success('Login successful!');
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.message || 'Login failed');
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(userData);
          
          if (response.success) {
            set({
              user: response.user,
              token: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success('Registration successful!');
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.message || 'Registration failed');
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
          toast.success('Logged out successfully');
        }
      },

      setUser: (user: User) => set({ user }),
      
      setToken: (token: string) => {
        // 同步更新 apiClient 的 token
        apiClient.setToken(token);
        localStorage.setItem('token', token);
        set({ 
          token,
          isAuthenticated: !!token, // 如果有 token，设置为已认证
        });
      },

      clearAuth: () => {
        // 同步清除 apiClient 的 token
        apiClient.clearToken();
        set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        });
      },

      refreshAuthToken: async () => {
        try {
          const response = await authApi.refreshToken();
          
          if (response.success) {
            // authApi.refreshToken 已经设置了 apiClient.setToken
            set({
              token: response.accessToken,
              refreshToken: response.refreshToken,
            });
          } else {
            get().clearAuth();
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().clearAuth();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // 当从 localStorage 恢复状态时，同步 token 到 apiClient
        if (state?.token) {
          apiClient.setToken(state.token);
        }
      },
    }
  )
);

