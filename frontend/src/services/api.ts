import axios from 'axios';
import { SUPPORTED_LANGS } from '@/src/lib/i18nRouting';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/** Get current language from URL path for redirect */
function getLoginPath(): string {
  const pathParts = window.location.pathname.split('/');
  const lang = pathParts[1] && SUPPORTED_LANGS.includes(pathParts[1]) ? pathParts[1] : 'zh-TW';
  return `/${lang}/login`;
}

/** Read CSRF token from cookie */
function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies (refreshToken + csrf_token)
});

// Request interceptor - attach access token + CSRF token
api.interceptors.request.use(
  (config) => {
    // Access token (still in localStorage — short-lived, 15m)
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRF token (from cookie, sent as header for double-submit validation)
    const csrf = getCsrfToken();
    if (csrf) {
      config.headers['X-CSRF-Token'] = csrf;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 + token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refresh token is now in HttpOnly cookie — no need to check localStorage
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token sent automatically via HttpOnly cookie (withCredentials: true)
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = getLoginPath();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
