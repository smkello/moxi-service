# 架构设计文档

## 项目结构

```
content-management-service/
├── src/
│   ├── config/              # 配置管理
│   │   └── index.js         # 环境变量和配置加载
│   ├── database/            # 数据访问层
│   │   ├── base.js          # 数据库适配器基类
│   │   ├── nedbAdapter.js   # NeDB 适配器实现
│   │   ├── mongoDbAdapter.js # MongoDB 适配器实现
│   │   └── index.js         # 数据库工厂和初始化
│   ├── services/            # 业务逻辑层
│   │   ├── baseService.js   # 基础服务类（CRUD操作）
│   │   ├── projectsService.js
│   │   ├── contentConfigsService.js
│   │   ├── fieldsService.js
│   │   ├── elementsService.js
│   │   ├── behaviorsService.js
│   │   ├── datasourcesService.js
│   │   └── designProjectsService.js
│   ├── controllers/         # 控制器层
│   │   ├── baseController.js
│   │   ├── projectsController.js
│   │   ├── contentConfigsController.js
│   │   ├── fieldsController.js
│   │   ├── elementsController.js
│   │   ├── behaviorsController.js
│   │   ├── datasourcesController.js
│   │   └── designProjectsController.js
│   ├── routes/              # 路由层
│   │   ├── projectsRoutes.js
│   │   ├── contentConfigsRoutes.js
│   │   ├── fieldsRoutes.js
│   │   ├── elementsRoutes.js
│   │   ├── behaviorsRoutes.js
│   │   ├── datasourcesRoutes.js
│   │   ├── designProjectsRoutes.js
│   │   └── apiDocsRoutes.js
│   ├── middleware/          # 中间件
│   │   ├── errorHandler.js  # 错误处理
│   │   └── requestValidator.js # 请求验证
│   ├── docs/                # API 文档源数据
│   └── index.js             # 应用入口
├── env/                     # 多环境配置文件
├── data/                    # NeDB 数据文件目录
├── api-doc-all-json-*.json  # API 定义文件
├── package.json
├── .env                     # （可选）本地环境覆盖
└── README.md
```

## 多环境配置策略

- 配置文件分层：`env/base.env` → `env/<env>.env` → `env/<env>.local.env` → 根目录 `.env*`
- 加载顺序遵循“通用优先，环境覆盖”，通过 `APP_ENV`/`NODE_ENV` 自动选择
- 适用于本地开发、自动化测试、生产构建等多套环境，无需重复拷贝 `.env`

## API 文档导出

- `docs/apiDocLoader.js` 从 JSON 定义加载模块与端点，并缓存结果
- `ApiDocsService` 提供 JSON、Postman、Markdown、OpenAPI 四种导出格式
- `ApiDocsRoutes` 支持全量、按模块、按接口级别的导出接口

## 核心设计模式

### 1. 适配器模式 (Adapter Pattern)

数据库适配器模式实现了 NeDB 和 MongoDB 之间的无缝切换：

- **DatabaseAdapter** (基类): 定义统一的数据库操作接口
- **NeDBAdapter**: NeDB 实现
- **MongoDBAdapter**: MongoDB 实现

通过环境变量 `DB_TYPE` 控制使用哪个适配器，无需修改业务代码。

### 2. 服务层模式 (Service Layer Pattern)

- **BaseService**: 提供通用的 CRUD 操作
- 每个集合对应一个服务实例
- 服务层封装数据库操作，提供业务逻辑

### 3. 控制器层模式 (Controller Layer Pattern)

- **BaseController**: 提供通用的请求处理方法
- **CustomHandlers**: 处理特殊端点（如状态切换、配置保存等）
- 控制器负责处理 HTTP 请求和响应

### 4. 路由自动生成

基于 API 定义文件自动生成路由：

1. 解析 API 定义 JSON 文件
2. 为每个模块生成对应的路由
3. 根据端点类型自动选择处理器
4. 支持自定义处理器覆盖默认行为

## 数据存储

### NeDB (开发环境)

- 文件数据库，无需额外服务
- 数据存储在 `./data` 目录
- 每个集合对应一个 `.db` 文件
- 适合开发和测试

### MongoDB (生产环境)

- 需要 MongoDB 服务
- 支持连接字符串配置
- 支持副本集和分片
- 适合生产环境

## API 端点映射

API 定义文件中的端点会自动映射到路由：

- `GET /projects` → `projectsController.list()`
- `POST /projects` → `projectsController.create()`
- `GET /projects/{id}` → `projectsController.getById()`
- `PUT /projects/{id}` → `projectsController.update()`
- `DELETE /projects/{id}` → `projectsController.delete()`
- `PATCH /projects/{id}/status` → `ProjectsController.toggleProjectStatus()`
- `PUT /projects/{id}/config/{language}` → `ProjectsController.saveProjectConfig()`

## 错误处理

- 统一的错误响应格式
- 自动捕获未处理的异常
- 404 资源不存在处理
- 400 请求验证失败处理
- 500 服务器错误处理

## 安全特性

- Helmet.js 安全头设置
- CORS 跨域支持
- 请求体大小限制
- 输入验证（可选）

## 扩展性

### 添加新的自定义端点

1. 在对应的 `*.Controller.js` 中添加方法
2. 在对应的 `*.Routes.js` 中注册路由
3. 如需共享逻辑，可在 Service 层扩展通用方法

### 添加新的数据库适配器

1. 继承 `DatabaseAdapter` 基类
2. 实现所有抽象方法
3. 在 `database/index.js` 中添加适配器选择逻辑

### 添加新的中间件

1. 在 `middleware/` 目录创建新文件
2. 在 `src/index.js` 中注册中间件

## 最佳实践

1. **环境变量管理**: 通过 `env/` 目录 + `.env*` 文件实现多层覆盖
2. **错误处理**: 统一错误响应格式
3. **日志记录**: 使用 Morgan 记录请求日志
4. **代码组织**: 按功能模块组织代码
5. **类型安全**: 使用 JSDoc 注释增强代码可读性
6. **优雅关闭**: 实现 SIGTERM/SIGINT 信号处理

