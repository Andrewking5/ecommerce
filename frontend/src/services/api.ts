import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

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
        // 添加 Accept-Language header（預設為英文）
        const language = localStorage.getItem('i18nextLng') || 'en';
        config.headers['Accept-Language'] = language;
        
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
          // 嘗試從 localStorage 重新加載 token（防止 token 丟失）
          // 這確保即使內存中的 token 丟失，也能從 localStorage 恢復
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            // 生產環境也輸出警告，幫助診斷
            console.warn('⚠️ API Request: Token not in memory, reloading from localStorage', {
              url: config.url,
              hasStoredToken: !!storedToken,
            });
            this.token = storedToken;
            config.headers.Authorization = `Bearer ${this.token}`;
          } else {
            // 生產環境也輸出警告
            console.warn('⚠️ API Request without token:', {
              url: config.url,
              method: config.method,
            });
          }
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
      async (error) => {
        const originalRequest = error.config;

        // 401 错误：尝试刷新 token
        if (error.response?.status === 401 && !originalRequest._retry) {
          // 如果已经在刷新 token，将请求加入队列
          if (this.isRefreshing) {
            console.log('🔄 Token refresh in progress, queuing request:', originalRequest.url);
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          console.log('🔄 Attempting to refresh token...');

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              console.error('❌ No refresh token available');
              throw new Error('No refresh token available');
            }

            // 调用刷新 token API（不使用 apiClient，避免循环）
            console.log('🔄 Calling refresh token API...');
            const response = await axios.post(
              `${this.client.defaults.baseURL}/auth/refresh`,
              { refreshToken },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            if (response.data.success && response.data.accessToken) {
              const newToken = response.data.accessToken;
              const newRefreshToken = response.data.refreshToken;

              console.log('✅ Token refreshed successfully');

              // 更新 token
              this.setToken(newToken);
              localStorage.setItem('token', newToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }

              // 更新原始请求的 token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // 处理队列中的请求
              this.processQueue(null, newToken);

              // 重新发送原始请求
              console.log('🔄 Retrying original request:', originalRequest.url);
              return this.client(originalRequest);
            } else {
              console.error('❌ Token refresh failed: Invalid response format');
              throw new Error('Token refresh failed: Invalid response format');
            }
          } catch (refreshError: any) {
            console.error('❌ Token refresh error:', {
              message: refreshError?.message,
              response: refreshError?.response?.data,
              status: refreshError?.response?.status,
            });
            
            // 刷新失败，处理队列并清除 token
            this.processQueue(refreshError, null);
            this.clearToken();
            
            // 延迟跳转，让用户看到错误信息
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 1000);
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
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

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
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

// 從本地儲存載入 token（在模組初始化時）
// 這確保頁面刷新後 token 仍然可用（正式版和本地都適用）
const token = localStorage.getItem('token');
if (token) {
  apiClient.setToken(token);
  // 生產環境也輸出，幫助診斷問題
  if (import.meta.env.PROD) {
    console.log('🔑 Token loaded from localStorage (production)');
  } else {
    console.log('🔑 Token loaded from localStorage (development)');
  }
} else {
  // 生產環境也輸出，幫助診斷
  if (import.meta.env.PROD) {
    console.log('⚠️ No token found in localStorage (production)');
  }
}


