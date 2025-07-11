import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import AdminLayout from '../components/layout/AdminLayout';
import AdminRoute from './AdminRoute';
import BoxManagementPage from '../pages/admin/BoxManagementPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // 应用 MainLayout 布局
    errorElement: <NotFoundPage />, // 错误页面
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      // {
      //   path: 'admin/boxes',
      //   element: <BoxManagementPage />,
      // }
      // 你可以在这里继续添加其他使用 MainLayout 的页面
      // { path: 'showcase', element: <ShowcasePage /> },
    ],
  },
  // 添加后台管理路由
  {
    path: '/admin',
    element: <AdminRoute />, // 首先通过管理员守卫
    children: [
      {
        element: <AdminLayout />, // 然后应用后台专用布局
        children: [
          { path: 'boxes', element: <BoxManagementPage /> },
          // { path: 'items', element: <ItemManagementPage /> },
          // { index: true, element: <AdminDashboard /> }
        ]
      }
    ]
  }
]);

export default router;