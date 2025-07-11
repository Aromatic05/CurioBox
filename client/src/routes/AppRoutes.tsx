import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import AdminLayout from '../components/layout/AdminLayout';
import AdminRoute from './AdminRoute';
import AdminHomePage from '../pages/admin/AdminHomePage';
import BoxManagementPage from '../pages/admin/BoxManagementPage';
import BoxEditPage from '../pages/admin/BoxEditPage';

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
                    { index: true, element: <AdminHomePage /> }, // 管理后台首页
                    { path: 'boxes', element: <BoxManagementPage /> },
                    { path: 'box/edit', element: <BoxEditPage /> }, // 新建盲盒
                    { path: 'box/edit/:id', element: <BoxEditPage /> }, // 编辑盲盒
                    // { path: 'items', element: <ItemManagementPage /> },
                    // { index: true, element: <AdminDashboard /> }
                ]
            }
        ]
    }
]);

export default router;