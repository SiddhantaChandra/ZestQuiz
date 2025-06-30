'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';

// Export the context so it can be imported elsewhere
export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      cleanupAuth();
    } finally {
      setLoading(false);
    }
  };

  const cleanupAuth = () => {
    Cookies.remove('token');
    Cookies.remove('userRole');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = async (token, user) => {
    // Set cookies
    Cookies.set('token', token, {
      expires: 1, // 1 day
      sameSite: 'lax',
      path: '/'
    });
    
    Cookies.set('userRole', user.role, {
      expires: 1,
      sameSite: 'lax',
      path: '/'
    });

    // Update API headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const logout = () => {
    cleanupAuth();
    window.location.href = '/auth/login';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 