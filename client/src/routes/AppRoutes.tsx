import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // 应用 MainLayout 布局
    errorElement: <NotFoundPage />, // 错误页面
    children: [
      {
        index: true, // index: true 表示这是父路由 '/' 的默认子路由
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      // 你可以在这里继续添加其他使用 MainLayout 的页面
      // { path: 'showcase', element: <ShowcasePage /> },
    ],
  },
  // 在这里可以添加其他不使用 MainLayout 的路由，例如独立的后台登录页
  // { path: '/admin/login', element: <AdminLoginPage /> }
]);

export default router;