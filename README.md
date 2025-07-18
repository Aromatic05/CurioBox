# CurioBox 项目说明

## 技术栈

- **前端**：
  - 使用 React 19 + TypeScript 进行开发，基于 Vite 构建，具备高效的开发体验和现代化特性。
  - 组件库采用 MUI（Material UI），提供丰富的高质量 UI 组件，支持主题定制。
  - 样式方案结合 Tailwind CSS，实现原子化 CSS 快速开发。
  - 路由管理采用 React Router（react-router-dom），支持多页面和嵌套路由。
  - 网络请求通过 Axios 实现，便于与后端 API 交互。

- **后端**：
  - 基于 NestJS 11 + TypeScript，采用模块化架构，便于扩展和维护。
  - 数据库使用 SQLite，轻量级、易于本地开发和测试。
  - 数据访问层采用 TypeORM，支持实体建模和数据库迁移。
  - 认证与权限采用 JWT（JSON Web Token）机制，配合 Passport 实现多策略认证。

- **包管理**：
  - 采用 pnpm 进行依赖管理和 Monorepo 多包统一管理，提升安装速度和一致性。

## 安装依赖

本项目采用 [pnpm](https://pnpm.io/) 进行包管理。首次拉取代码后请先执行：

```sh
pnpm install
```

> ⚠️ 安装依赖后，还需执行：
>
> ```sh
> pnpm approve-builds
> ```
>
> 以允许依赖包的编译。

如遇依赖相关问题，请优先确认已执行上述命令。

---

## 目录结构

- `client/` 前端项目，基于 React + Vite
- `server/` 后端项目，基于 NestJS

---


## 后端 API 文档（Swagger）

后端已集成 Swagger，可用于在线查看和调试所有 API 接口。

- 启动后端服务后，访问：
  - 本地开发环境：`http://localhost:3000/api`

---

## 常用命令

### 根目录（Monorepo 管理）

- 启动前后端开发环境：
  ```sh
  pnpm dev
  ```
- 统一构建所有子项目：
  ```sh
  pnpm build
  ```
- 统一代码检查：
  ```sh
  pnpm lint
  ```
- 统一代码格式化：
  ```sh
  pnpm format
  ```

- 一键打包前后端 release 产物（适合生产部署）：
  ```sh
  pnpm bundle
  ```
  产物会输出到 `server/build/` 目录，包含后端可执行文件和前端静态资源。

- 启动打包后的 release 产物：
  ```sh
  pnpm bundle_start
  ```
  生产环境下会自动运行 `server/build/index.js`，前端静态资源可通过同一端口访问。

### 前端 client/

- 启动开发环境：
  ```sh
  pnpm --filter client dev
  ```
- 构建生产包：
  ```sh
  pnpm --filter client build
  ```
- 预览生产包：
  ```sh
  pnpm --filter client preview
  ```
- 代码检查：
  ```sh
  pnpm --filter client lint
  ```

### 后端 server/

- 启动开发环境（自动重载）：
  ```sh
  pnpm --filter server start:dev
  ```
- 启动生产环境：
  ```sh
  pnpm --filter server start:prod
  ```
- 运行 e2e 测试：
  ```sh
  pnpm --filter server test:e2e
  ```
- 代码检查：
  ```sh
  pnpm --filter server lint
  ```

---

如有更多开发或部署问题，请查阅各子目录下的 README 或联系维护者。
