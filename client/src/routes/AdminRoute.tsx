// src/routes/AdminRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material'; // 可选，用于加载状态

const AdminRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  console.log('AdminRoute rendered', { user, isAuthenticated });

  // 如果 user 还没加载出来，显示加载中
  if (isAuthenticated && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 必须已认证且角色为 'admin'
  if (!isAuthenticated || user?.role !== 'admin') {
    // 如果未认证，重定向到登录页
    // 如果已认证但不是管理员，重定向到首页
    return <Navigate to={isAuthenticated ? '/' : '/login'} state={{ from: location }} replace />;
  }

  return <Outlet />; // 条件满足，渲染子路由
};

export default AdminRoute;