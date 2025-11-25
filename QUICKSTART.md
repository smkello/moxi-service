# 快速启动指南

## 1. 安装依赖

```bash
npm install
```

## 2. 配置环境变量

项目内置 `env/` 目录，用于集中管理多环境配置：

- `env/base.env`：通用配置
- `env/development.env`、`env/test.env`、`env/production.env`：环境覆盖
- 根目录 `.env*` 文件（可选）：适合注入敏感变量或 CI/CD 构建时写入

应用会根据 `APP_ENV`/`NODE_ENV` 自动加载对应文件，后加载的文件会覆盖前面的值。打包或部署时只需设置目标环境，无需手动拷贝配置。

## 3. 启动服务

开发模式（自动重启）：
```bash
npm run dev
```

其他环境：
```bash
npm run start:dev   # 使用开发配置
npm run start:test  # 使用测试配置
npm start           # 使用生产配置
```

## 4. 测试 API

服务启动后，访问以下端点：

- 健康检查: `http://localhost:3000/api/health`
- API 文档: `http://localhost:3000/api/api-docs`
- 项目列表: `http://localhost:3000/api/projects`

## 5. 示例请求

### 创建项目

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-project-1",
    "code": "test",
    "name": "测试项目",
    "languages": ["zh-cn"],
    "status": false,
    "contentConfigs": [],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }'
```

### 查询项目列表

```bash
curl http://localhost:3000/api/projects
```

### 切换项目状态

```bash
curl -X PATCH http://localhost:3000/api/projects/test-project-1/status \
  -H "Content-Type: application/json" \
  -d '{"status": true}'
```

## 数据库切换

项目支持两种数据库：

1. **NeDB** (默认，适合开发)
   - 文件数据库，无需安装额外服务
   - 数据存储在 `./data` 目录

2. **MongoDB** (适合生产)
   - 需要安装并运行 MongoDB
   - 通过环境变量配置连接

切换数据库只需在对应环境文件中调整 `DB_TYPE`，无需修改代码。

