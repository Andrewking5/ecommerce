import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '@/src/services/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && user) {
      api.get('/users/profile')
        .then(({ data }) => {
          if (data.success) {
            setUser(data.data);
            localStorage.setItem('user', JSON.stringify(data.data));
          }
        })
        .catch(() => {
          // Token invalid, clear auth state
          // (refreshToken cookie is HttpOnly, cleared by backend on logout)
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      // accessToken in localStorage (short-lived, 15m)
      // refreshToken set as HttpOnly cookie by backend automatically
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (registerData: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    const { data } = await api.post('/auth/register', registerData);
    if (data.success) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Backend clears the HttpOnly refreshToken cookie
      await api.post('/auth/logout');
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isAdmin: user?.role === 'ADMIN', login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
