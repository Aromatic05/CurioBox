// src/routes/PrivateRoute.tsx
import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const PrivateRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // 将用户重定向到登录页，并保存他们想访问的页面路径
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />; // 如果已登录，则渲染子路由
};

export default PrivateRoute;
