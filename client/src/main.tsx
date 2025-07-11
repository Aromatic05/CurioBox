import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom'; // 导入 RouterProvider
import router from './routes/AppRoutes'; // 导入我们创建的 router
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 使用 RouterProvider 并传入 router 配置 */}
    <RouterProvider router={router} />
  </React.StrictMode>
);