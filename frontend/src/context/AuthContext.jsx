// Fungsi: Context React untuk state global aplikasi.
// frontend/src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);
const CSRF_STORAGE_KEY = 'pelanggan_csrf_token';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
      return null;
    } catch { 
      return null; 
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const saveUser = useCallback((userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      setUser(null);
      localStorage.removeItem('user');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const res = await getCurrentUser();
      if (res.success && res.data) {
        saveUser(res.data);
        return res.data;
      }
    } catch (err) {
      console.error('refreshUser error:', err);
      // Jika token invalid atau expired, clear storage
      if (err.message?.includes('401') || err.message?.includes('Sesi habis')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem(CSRF_STORAGE_KEY);
      }
    }
    return null;
  }, [saveUser]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        await refreshUser();
      }
      setLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.success) {
      sessionStorage.removeItem(CSRF_STORAGE_KEY);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      saveUser(res.data.user);
      return res;
    }
    throw new Error(res.message || 'Login gagal');
  }, [saveUser]);

  const logout = useCallback(async () => {
    try { 
      await apiLogout(); 
    } catch (err) { 
      console.error(err); 
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem(CSRF_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = { 
    user, 
    token, 
    loading, 
    login, 
    logout, 
    refreshUser, 
    isAuthenticated: !!token && !!user 
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
