import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../api/apiClient';
import { fetchUserData } from '../api/authApi';

// 1. 定义数据类型
interface IUser {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  login: (token: string, userData: IUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// 2. 创建 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. 创建 Provider 组件
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // 自动获取用户信息
      fetchUserData()
        .then(res => setUser(res.data))
        .catch(() => setUser(null));
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string, userData: IUser) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('accessToken', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. 创建自定义 Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 5. 在 App 入口使用 Provider
//    请确保在 main.tsx 或 App.tsx 中用 <AuthProvider> 包裹你的应用
//    例如，在 main.tsx 中:
//    <React.StrictMode>
//      <AuthProvider>
//        <RouterProvider router={router} />
//      </AuthProvider>
//    </React.StrictMode>