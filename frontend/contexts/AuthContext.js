'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  showLoginSuccessToast,
  showLogoutSuccessToast,
  showAuthErrorToast,
  withToastErrorHandler
} from '@/lib/toast';

const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
};

const deleteCookie = (name) => {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
};

export const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          setCookie('token', token, 7);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await api.get('/auth/check');
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        cleanupAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  
  const cleanupAuth = () => {
    setUser(null);
    localStorage.removeItem('token');
    deleteCookie('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      setCookie('token', access_token, 7);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(user);
      
      showLoginSuccessToast(user.email.split('@')[0]);

      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    cleanupAuth();
    showLogoutSuccessToast();
    router.replace('/');
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 