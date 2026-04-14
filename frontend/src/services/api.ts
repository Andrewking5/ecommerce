import axios from 'axios';
import { SUPPORTED_LANGS } from '@/src/lib/i18nRouting';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/** Get current language from URL path for redirect */
function getLoginPath(): string {
  const pathParts = window.location.pathname.split('/');
  const lang = pathParts[1] && SUPPORTED_LANGS.includes(pathParts[1]) ? pathParts[1] : 'zh-TW';
  return `/${lang}/login`;
}

/** CSRF token cached in memory (fetched from API for cross-origin support) */
let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await axios.get(`${API_URL}/auth/csrf-token`, { withCredentials: true });
    csrfToken = res.data.csrfToken;
    return csrfToken;
  } catch {
    return null;
  }
}

// Eagerly fetch CSRF token on module load
fetchCsrfToken();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies (refreshToken + csrf_token)
});

// Request interceptor - attach access token + CSRF token
api.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRF token (fetched from API, sent as header for double-submit validation)
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
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
      // Only attempt refresh if user was authenticated (had a token).
      // Public API calls (events, products, etc.) should never trigger login redirect.
      const hadToken = !!originalRequest.headers.Authorization;
      if (!hadToken) {
        return Promise.reject(error);
      }

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
        setAccessToken(accessToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
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
