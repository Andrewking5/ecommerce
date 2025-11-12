import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 請求攔截器
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
          // 調試信息（僅在開發環境）
          if (import.meta.env.DEV) {
            console.log('📤 API Request:', {
              url: config.url,
              method: config.method,
              hasToken: !!this.token,
              tokenPreview: this.token.substring(0, 20) + '...',
            });
          }
        } else {
          console.warn('⚠️ API Request without token:', config.url);
        }
        // 如果是 FormData，不设置 Content-Type，让浏览器自动设置
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 回應攔截器
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token 過期，清除本地儲存
          this.clearToken();
          window.location.href = '/auth/login';
          return Promise.reject(error);
        }
        
        // 403 错误特殊处理（权限不足）
        if (error.response?.status === 403) {
          const errorData = error.response?.data;
          let message = '权限不足';
          
          if (errorData?.message) {
            message = errorData.message;
          }
          
          toast.error(message);
          return Promise.reject(error);
        }
        
        // 顯示錯誤訊息
        const errorData = error.response?.data;
        let message = 'An error occurred';
        
        if (errorData) {
          // 如果有验证错误详情，显示详情
          if (errorData.details && Array.isArray(errorData.details)) {
            message = errorData.details.join(', ');
          } else if (errorData.message) {
            message = errorData.message;
          }
        }
        
        toast.error(message);
        
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // 如果是 FormData，不设置 Content-Type，让浏览器自动设置
    const finalConfig = data instanceof FormData
      ? { ...config, headers: { ...config?.headers } }
      : config;
    const response = await this.client.post(url, data, finalConfig);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }
}

// 建立 API 客戶端實例
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 調試：在控制台顯示當前使用的 API URL
if (import.meta.env.PROD) {
  console.log('🌐 Production API URL:', apiBaseURL);
  console.log('🌐 VITE_API_URL from env:', import.meta.env.VITE_API_URL || 'NOT SET');
} else {
  console.log('🔧 Development API URL:', apiBaseURL);
}

export const apiClient = new ApiClient(apiBaseURL);

// 從本地儲存載入 token
const token = localStorage.getItem('token');
if (token) {
  apiClient.setToken(token);
}


