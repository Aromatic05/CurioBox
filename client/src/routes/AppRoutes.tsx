import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import StorePage from "../pages/store/StorePage"; // 新主页
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import AdminLayout from "../components/layout/AdminLayout";
import AdminRoute from "./AdminRoute";
import AdminHomePage from "../pages/admin/AdminHomePage";
import BoxManagementPage from "../pages/admin/BoxManagementPage";
import BoxEditPage from "../pages/admin/BoxEditPage";
import ItemManagementPage from "../pages/admin/ItemManagementPage";
import ItemEditPage from "../pages/admin/ItemEditPage";
import OrderManagementPage from "../pages/admin/OrderManagementPage";
import AdminPostManagePage from "../pages/admin/AdminPostManagePage"; // 引入帖子管理页面
import ShowcasePage from "../pages/showcase/ShowcasePage";
import PostDetailPage from "../pages/showcase/PostDetailPage";
import CurioBoxDetailPage from "../pages/store/CurioBoxDetailPage"; // 引入详情页组件
import CreatePostPage from "../pages/showcase/CreatePostPage";
import PrivateRoute from "./PrivateRoute";
import UserDashboardLayout from "../pages/user/UserDashboardLayout";
import UserProfileSettings from "../pages/user/UserProfileSettings";
import WarehousePage from "../pages/user/WarehousePage";
import MyPostsPage from "../pages/user/MyPostsPage";
import HistoryPage from "../pages/user/HistoryPage";
import ItemWarehousePage from "../pages/user/ItemWarehousePage";
import UserManagePage from "../pages/admin/UserManagePage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />, // 应用 MainLayout 布局
        errorElement: <NotFoundPage />, // 错误页面
        children: [
            {
                index: true,
                element: <StorePage />, // 主页改为商店页面
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "register",
                element: <RegisterPage />,
            },
            {
                path: "showcase",
                element: <ShowcasePage />,
            },
            {
                path: "showcase/:id",
                element: <PostDetailPage />,
            },
            {
                path: "box/:id", // 新增路由
                element: <CurioBoxDetailPage />,
            },
            {
                element: <PrivateRoute />,
                children: [
                    {
                        path: "showcase/create",
                        element: <CreatePostPage />,
                    },
                ],
            },
            {
                path: "user",
                element: <PrivateRoute />, // 整个个人中心都需要登录
                children: [
                    {
                        element: <UserDashboardLayout />, // 应用仪表盘布局
                        children: [
                            {
                                index: true,
                                element: (
                                    <Navigate to="/user/warehouse" replace />
                                ),
                            },
                            { path: "warehouse", element: <WarehousePage /> },
                            { path: "items", element: <ItemWarehousePage /> },
                            { path: "posts", element: <MyPostsPage /> },
                            { path: "history", element: <HistoryPage /> },
                            {
                                path: "settings",
                                element: <UserProfileSettings />,
                            },
                        ],
                    },
                ],
            },
            // 你可以在这里继续添加其他使用 MainLayout 的页面
            // { path: 'showcase', element: <ShowcasePage /> },
        ],
    },
    // 添加后台管理路由
    {
        path: "/admin",
        element: <AdminRoute />, // 首先通过管理员守卫
        children: [
            {
                element: <AdminLayout />, // 然后应用后台专用布局
                children: [
                    { index: true, element: <AdminHomePage /> }, // 管理后台首页
                    { path: "boxes", element: <BoxManagementPage /> },
                    { path: "box/edit", element: <BoxEditPage /> }, // 新建盲盒
                    { path: "box/edit/:id", element: <BoxEditPage /> }, // 编辑盲盒
                    { path: "items", element: <ItemManagementPage /> },
                    { path: "item/edit", element: <ItemEditPage /> }, // 新建物品
                    { path: "item/edit/:id", element: <ItemEditPage /> }, // 编辑物品
                    { path: "users", element: <UserManagePage /> }, // 用户管理
                    { path: "orders", element: <OrderManagementPage /> }, // 订单管理
                    { path: "posts", element: <AdminPostManagePage /> }, // 帖子管理
                    // { index: true, element: <AdminDashboard /> }
                ],
            },
        ],
    },
]);

export default router;
