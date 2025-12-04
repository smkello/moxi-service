import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import { initDatabase, closeDatabase } from './database/index.js';
import routes from './routes/index.js';
import { renderHomePage, renderModulePage } from './docs/htmlRenderer.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createHeartbeatMiddleware, createHeartbeatRoutes } from '@smk/heartbeat-sdk';
import { authMiddleware } from './middleware/authMiddlewareInstance.js';
import openApiRoutes from './routes/openApiRoutes.js';
import apiDocsExportRoutes from './routes/apiDocsExportRoutes.js';

const app = express();

// 安全中间件 - 配置 CSP 允许内联脚本和事件处理器（用于文档页面）
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS 配置
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || '*',
//   credentials: true,
// }));

// 日志中间件
if (config.server.debug || config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 解析 JSON 请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 对外开放 Open API（不需要认证和心跳校验，这是公开接口）
app.use('/open-api', openApiRoutes);

const heartbeatConfig = config.sdk?.heartbeat || {};

// 心跳激活接口（无需登录，直接挂载SDK自带路由）
app.use(createHeartbeatRoutes(heartbeatConfig));

// 心跳检测中间件（在API路由之前，用于拦截异常访问）
app.use('/api', createHeartbeatMiddleware({
  excludePaths: ['/activate'], // Express 在 /api 前缀下实际 path 为 /activate
  whitelist: [],
  forceCheck: config.sdk?.heartbeat?.forceCheck || false,
}));

// 接口文档导出路由（不需要登录校验，在认证中间件之前注册）
app.use('/api', apiDocsExportRoutes);

// 应用认证中间件到所有API路由
app.use('/api', authMiddleware);

// API 路由
app.use('/api', routes);

// 根路径（需要认证）
app.get('/', authMiddleware, (req, res) => {
  res.json({
    name: '内容管理系统 API',
    version: '1.0.0',
    status: 'running',
    database: config.database.type,
    timestamp: new Date().toISOString(),
  });
});

// 可视化文档页面（保持公开，方便查看文档）
app.get('/docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderHomePage());
});

// 模块详情页（保持公开，方便查看文档）
app.get('/docs/module/:moduleId', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderModulePage(req.params.moduleId));
});

// 404 处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();
    console.log(`数据库类型: ${config.database.type}`);
    
    // 启动 HTTP 服务器
    const server = app.listen(config.server.port, () => {
      console.log(`服务器运行在 http://localhost:${config.server.port}`);
      console.log(`环境: ${config.server.env}`);
      console.log(`Debug 模式: ${config.server.debug ? '开启' : '关闭'}`);
      console.log(`API 文档: http://localhost:${config.server.port}/api/api-docs`);
    });

    // 优雅关闭
    const gracefulShutdown = async (signal) => {
      console.log(`收到 ${signal} 信号，开始优雅关闭...`);
      
      server.close(async () => {
        console.log('HTTP 服务器已关闭');
        
        try {
          await closeDatabase();
          console.log('数据库连接已关闭');
          process.exit(0);
        } catch (error) {
          console.error('关闭数据库连接时出错:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 启动应用
startServer();

export default app;

