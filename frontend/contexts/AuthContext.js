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

// Cookie helper functions
const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
};

const deleteCookie = (name) => {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
};

// Export the context
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

  // Check token and load user data on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/profile');
          setUser(response.data);
          console.log('Auth check - User data:', response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          cleanupAuth(); // Clean up if token is invalid
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Clean up authentication state
  const cleanupAuth = () => {
    setUser(null);
    localStorage.removeItem('token');
    deleteCookie('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    try {
      // First, make the login request
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      const { access_token, user: userData } = response.data;

      // Set the token in both localStorage and cookie
      localStorage.setItem('token', access_token);
      setCookie('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Update the user state
      setUser(userData);

      // Show success toast
      showLoginSuccessToast(userData.email.split('@')[0]);

      // Redirect based on role
      console.log('Redirecting user with role:', userData.role);
      if (userData.role === 'ADMIN') {
        // Use replace instead of push to avoid back button issues
        router.replace('/admin/dashboard');
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      cleanupAuth();
      showAuthErrorToast(error.response?.data?.message || 'Login failed');
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