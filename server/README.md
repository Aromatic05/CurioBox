# CurioBox 后端（server）说明

本项目基于 NestJS 11 + TypeScript，采用模块化架构，集成 TypeORM、JWT 认证、SQLite 数据库，支持 RESTful API 及 Swagger 文档。

> 本项目后端接口设计基本遵循 RESTful API 规范，资源路径、HTTP 方法、状态码等均按主流标准实现，便于前后端分离与自动化文档生成。

## 主要技术栈

- NestJS 11（Node.js 服务端框架）
- TypeScript
- TypeORM（ORM，支持 SQLite）
- SQLite（默认本地开发数据库）
- JWT + Passport（认证与权限）
- Swagger（API 文档）

## 目录结构

```text
server/
├── src/
│   ├── app.module.ts           # 应用主模块
│   ├── main.ts                 # 应用入口
│   ├── auth/                   # 认证模块（登录、注册、权限）
│   ├── curio-box/              # 盲盒相关模块
│   ├── items/                  # 物品相关模块
│   ├── orders/                 # 订单相关模块
│   ├── showcase/               # 展示区相关模块
│   ├── user-boxes/             # 用户盲盒模块
│   ├── users/                  # 用户模块
│   └── ...                     # 其它业务模块
├── uploads/                    # 静态资源上传目录（对外暴露 /static 路径）
├── test/                       # e2e 测试
├── curiobox.db                 # SQLite 数据库文件
├── package.json                # 后端依赖与脚本
├── tsconfig.json               # TypeScript 配置
└── ...
```

## 启动与开发

```sh
pnpm install
pnpm start:dev
```

## 常用命令

- 启动开发环境（自动重载）：
  ```sh
  pnpm start:dev
  ```
- 启动生产环境：
  ```sh
  pnpm start:prod
  ```
- 运行所有测试：
  ```sh
  pnpm test
  ```
- 运行 e2e 测试：
  ```sh
  pnpm test:e2e
  ```
- 代码检查：
  ```sh
  pnpm lint
  ```

## API 文档（Swagger）

后端集成 Swagger，启动服务后访问：

- 本地开发环境：`http://localhost:3000/api`

---
