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
      async (config) => {
        // 添加 Accept-Language header（預設為英文）
        const language = localStorage.getItem('i18nextLng') || 'en';
        config.headers['Accept-Language'] = language;
        
        // 优先使用内存中的token，如果没有则从localStorage加载
        if (!this.token) {
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            this.token = storedToken;
          } else {
            // 尝试从authStore获取token（如果存在）
            try {
              const { useAuthStore } = await import('@/store/authStore');
              const authStore = useAuthStore.getState();
              if (authStore.token) {
                this.token = authStore.token;
              }
            } catch (e) {
              // 忽略导入错误
            }
          }
        }
        
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
          // 生產環境也輸出警告
          console.warn('⚠️ API Request without token:', {
            url: config.url,
            method: config.method,
          });
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

        // 检查是否有原始请求配置（某些网络错误可能没有）
        if (!originalRequest) {
          // 如果没有原始请求，直接显示错误
          const errorData = error.response?.data;
          const message = errorData?.message || error.message || 'An error occurred';
          toast.error(message);
          return Promise.reject(error);
        }

        // 401 错误：尝试刷新 token
        if (error.response?.status === 401) {
          // 生产环境也显示关键日志，帮助诊断问题
          console.log('🔍 401 Unauthorized detected (will auto-retry):', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            hasRetry: originalRequest?._retry,
            isRefreshing: this.isRefreshing,
            hasRefreshToken: !!localStorage.getItem('refreshToken'),
          });

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

          // 如果已经重试过，不再重试
          if (originalRequest._retry) {
            console.warn('⚠️ Request already retried, skipping token refresh');
            const errorData = error.response?.data;
            const message = errorData?.message || 'Unauthorized';
            toast.error(message);
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          // 生产环境也显示关键日志
          console.log('🔄 Token expired, automatically refreshing...', {
            baseURL: this.client.defaults.baseURL,
            refreshEndpoint: `${this.client.defaults.baseURL}/auth/refresh`,
          });

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              console.error('❌ No refresh token available');
              console.error('💡 User needs to login again');
              throw new Error('No refresh token available');
            }

            // 调用刷新 token API（不使用 apiClient，避免循环）
            console.log('🔄 Calling refresh token API...', {
              endpoint: `${this.client.defaults.baseURL}/auth/refresh`,
              hasRefreshToken: !!refreshToken,
            });
            
            const response = await axios.post(
              `${this.client.defaults.baseURL}/auth/refresh`,
              { refreshToken },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                timeout: 10000, // 10秒超时
              }
            );

            console.log('📥 Refresh token response:', {
              success: response.data?.success,
              hasAccessToken: !!response.data?.accessToken,
              hasRefreshToken: !!response.data?.refreshToken,
              responseData: response.data, // 完整响应数据用于调试
            });

            // 检查响应格式：后端返回 { success: true, accessToken, refreshToken }
            if (response.data && response.data.success && response.data.accessToken) {
              const newToken = response.data.accessToken;
              const newRefreshToken = response.data.refreshToken || refreshToken; // 如果没有新的refreshToken，使用旧的

              console.log('✅ Token refreshed successfully, retrying request...', {
                newTokenLength: newToken.length,
                hasNewRefreshToken: !!newRefreshToken,
              });

              // 更新 token
              this.setToken(newToken);
              localStorage.setItem('token', newToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }

              // 同步更新 authStore（如果存在）
              try {
                const { useAuthStore } = await import('@/store/authStore');
                const authStore = useAuthStore.getState();
                authStore.setToken(newToken);
                if (newRefreshToken) {
                  useAuthStore.setState({ refreshToken: newRefreshToken });
                }
              } catch (e) {
                // 如果导入失败，忽略（避免循环依赖）
                console.warn('Could not update authStore:', e);
              }

              // 确保原始请求的配置对象存在
              if (!originalRequest.headers) {
                originalRequest.headers = {};
              }
              
              // 更新原始请求的 token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              // 清除重试标记，允许重试
              delete originalRequest._retry;

              // 处理队列中的请求
              this.processQueue(null, newToken);

              // 重新发送原始请求（静默重试，不显示错误）
              return this.client(originalRequest);
            } else {
              console.error('❌ Token refresh failed: Invalid response format');
              throw new Error('Token refresh failed: Invalid response format');
            }
          } catch (refreshError: any) {
            // 生产环境详细错误日志
            const errorCode = refreshError?.response?.data?.code;
            const isRefreshTokenExpired = errorCode === 'REFRESH_TOKEN_EXPIRED';
            const isRefreshTokenInvalid = errorCode === 'REFRESH_TOKEN_INVALID';
            
            console.error('❌ Token refresh error:', {
              message: refreshError?.message,
              response: refreshError?.response?.data,
              status: refreshError?.response?.status,
              code: errorCode,
              baseURL: this.client.defaults.baseURL,
              endpoint: `${this.client.defaults.baseURL}/auth/refresh`,
              isNetworkError: !refreshError?.response,
              isRefreshTokenExpired,
              isRefreshTokenInvalid,
            });
            
            // 如果是网络错误，可能是 CORS 或连接问题
            if (!refreshError?.response) {
              console.error('🌐 Network error during token refresh - possible CORS or connection issue');
              console.error('💡 Check if backend is accessible and CORS is configured correctly');
              toast.error('无法连接到服务器，请检查网络连接');
            } else if (isRefreshTokenExpired || isRefreshTokenInvalid) {
              // Refresh token 过期或无效，需要重新登录
              console.warn('⚠️ Refresh token expired or invalid - user needs to login again');
              toast.error('登录已过期，请重新登录');
            } else {
              // 其他错误
              toast.error('Token 刷新失败，请重新登录');
            }
            
            // 刷新失败，处理队列并清除 token
            this.processQueue(refreshError, null);
            this.clearToken();
            
            // 延迟跳转，让用户看到错误信息
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, isRefreshTokenExpired || isRefreshTokenInvalid ? 1500 : 2000);
            
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


