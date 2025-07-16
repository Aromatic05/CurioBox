import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import apiClient from "../api/apiClient";
import { fetchUserData } from "../api/authApi";

// 1. 定义数据类型
interface IUser {
    id: number;
    username: string;
    role: string;
    nickname?: string;
    avatar?: string;
}

export interface AuthContextType {
    user: IUser | null;
    token: string | null;
    login: (token: string, userData: IUser) => void;
    logout: () => void;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
}

// 2. 创建 Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. 创建 Provider 组件
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("accessToken"),
    );

    const refreshUser = async () => {
        if (token) {
            try {
                const res = await fetchUserData();
                setUser(res.data);
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        if (token) {
            apiClient.defaults.headers.common["Authorization"] =
                `Bearer ${token}`;
            refreshUser();
        } else {
            delete apiClient.defaults.headers.common["Authorization"];
            setUser(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = (newToken: string, userData: IUser) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("accessToken", newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{ user, token, login, logout, isAuthenticated, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// 4. useAuth Hook 已迁移到 useAuth.ts

// 5. 在 App 入口使用 Provider
//    请确保在 main.tsx 或 App.tsx 中用 <AuthProvider> 包裹你的应用
//    例如，在 main.tsx 中:
//    <React.StrictMode>
//      <AuthProvider>
//        <RouterProvider router={router} />
//      </AuthProvider>
//    </React.StrictMode>
