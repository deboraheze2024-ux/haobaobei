'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Admin {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时验证 token
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const storedToken = localStorage.getItem('admin_token');
        if (storedToken) {
          const response = await fetch('/api/admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`,
            },
            body: JSON.stringify({ action: 'verify' }),
          });

          const data = await response.json();
          if (data.valid) {
            setToken(storedToken);
            setAdmin(data.admin);
          } else {
            localStorage.removeItem('admin_token');
          }
        }
      } catch (error) {
        console.error('Admin token verification failed:', error);
        localStorage.removeItem('admin_token');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setAdmin(data.admin);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: '登录失败，请稍后重试' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'logout' }),
        });
      }
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      setToken(null);
      setAdmin(null);
    }
  }, [token]);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
