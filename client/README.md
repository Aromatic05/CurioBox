# CurioBox 前端（client）说明

本项目基于 React 19 + TypeScript，使用 Vite 作为构建工具，集成 MUI、Tailwind CSS 及 React Router。


## 目录结构

```text
client/
├── public/                         # 公共静态资源（如 favicon、vite.svg）
├── src/                            # 源码主目录
│   ├── api/                        # 封装所有后端 API 请求
│   │   ├── apiClient.ts            # axios 实例与拦截器
│   │   ├── authApi.ts              # 认证相关 API
│   │   ├── curioBoxApi.ts          # 盲盒相关 API
│   │   ├── itemApi.ts              # 物品相关 API
│   │   ├── orderApi.ts             # 订单相关 API
│   │   ├── showcaseApi.ts          # 展示区相关 API
│   │   ├── userApi.ts              # 用户相关 API
│   │   └── userItemApi.ts          # 用户物品相关 API
│   ├── assets/                     # 静态资源（如图片、SVG）
│   │   └── react.svg
│   ├── components/                 # 通用组件
│   │   ├── BoxOpenAnimation.tsx    # 盲盒开箱动画组件
│   │   ├── GlobalBackground.tsx    # 全局背景组件
│   │   ├── GlobalBackground.css    # 全局背景样式
│   │   ├── ThemeToggle.tsx         # 主题切换组件
│   │   ├── layout/                 # 页面布局相关组件
│   │   ├── showcase/               # 展示区相关组件
│   │   └── store/                  # 商店相关组件
│   ├── context/                    # React Context 全局状态管理
│   │   └── AuthContext.tsx         # 认证上下文
│   ├── pages/                      # 路由页面（按业务模块分子目录）
│   │   ├── HomePage.tsx            # 首页
│   │   ├── NotFoundPage.tsx        # 404 页面
│   │   ├── admin/                  # 管理后台页面
│   │   ├── auth/                   # 登录注册等认证页面
│   │   ├── demo/                   # 演示页面
│   │   ├── showcase/               # 展示区页面
│   │   ├── store/                  # 商店页面
│   │   └── user/                   # 用户中心页面
│   ├── routes/                     # 路由配置
│   │   ├── AdminRoute.tsx          # 管理员权限路由
│   │   ├── AppRoutes.tsx           # 路由总表
│   │   └── PrivateRoute.tsx        # 需登录权限路由
│   ├── main.tsx                    # 应用主入口
│   ├── index.css                   # 全局样式
│   └── vite-env.d.ts               # Vite 环境类型声明
├── package.json                    # 前端依赖与脚本
├── tsconfig.json                   # TypeScript 配置
├── vite.config.ts                  # Vite 配置
└── ...  
```

## 主要技术栈

- React 19 + TypeScript
- Vite
- MUI（Material UI）
- Tailwind CSS
- React Router
- Axios

## 启动与开发

```sh
pnpm install
pnpm dev
```

更多命令请参考主项目根目录 README。
