# 内容管理系统 API 服务

基于 Node.js 和 Express 的内容管理系统后端服务，支持 NeDB 和 MongoDB 两种数据存储方式。

## 功能特性

- 完整的 RESTful API 实现
- 支持 NeDB（开发环境）和 MongoDB（生产环境）无缝切换
- 模块化架构设计
- 符合行业最佳实践

## 技术栈

- Node.js 18+
- Express.js
- NeDB / MongoDB
- Express Validator

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

项目支持「通用 + 多环境」两层配置，并已预置以下文件：

1. `env/base.env`：所有环境共享的默认配置
2. `env/development.env`：开发环境，默认使用 NeDB，端口 `5101`，`DEBUG=true`
3. `env/test.env`：测试环境，端口 `5201`，独立数据目录 `./data/test`
4. `env/production.env`：生产环境，默认切换到 MongoDB，可配置生产认证接口
5. 根目录 `.env`、`.env.development`、`.env.production` 等（可选）：用于覆盖敏感信息

环境解析顺序为 **base → 环境 → 环境本地**，后加载的值会覆盖前者。通过 `APP_ENV`/`NODE_ENV` 控制当前环境（默认 `development`）。构建或打包时，只需设置目标环境即可自动注入对应配置。

### 运行服务

开发模式（实时重载）：
```bash
npm run dev
```

指定环境运行：
```bash
# 显式使用开发环境配置
npm run start:dev

# 启动测试环境
npm run start:test

# 启动生产环境
npm start
```

### 构建 / 部署

CI/CD 或手动打包时，只需设置目标环境变量即可自动注入配置，例如：

```bash
# 构建生产镜像
APP_ENV=production npm start

# 运行测试包
APP_ENV=test node dist/index.js
```

`APP_ENV` 优先级高于 `NODE_ENV`，便于与构建工具区分。

## API 文档

服务启动后，可通过以下接口获取文档：

- `GET /api/api-docs`：查看原始 JSON 定义
- `GET /api/docs`：模块概览（含接口数量、说明）
- `GET /api/docs/export?format=json|postman|markdown|openapi`：导出全量 API
- `GET /api/docs/module/{moduleId}/export?format=...`：导出单个模块
- `GET /api/docs/endpoint/{moduleId}/{endpointId}/export?format=...`：导出单个接口

## 项目结构

```
.
├── src/
│   ├── config/          # 配置文件
│   ├── database/        # 数据库适配器
│   ├── controllers/     # 各业务控制器
│   ├── services/        # 领域服务
│   ├── routes/          # 路由注册
│   ├── middleware/      # 中间件
│   └── index.js         # 应用入口
├── env/                # 多环境配置
├── data/                # NeDB 数据文件目录
├── .env                 # 环境变量配置
└── package.json
```

## 数据库切换

通过环境变量 `DB_TYPE` 控制使用的数据库：

- `nedb`: 使用 NeDB（文件数据库，适合开发环境）
- `mongodb`: 使用 MongoDB（适合生产环境）

切换数据库类型无需修改代码，只需更改环境变量即可。

