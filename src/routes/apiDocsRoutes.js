import { Router } from 'express';
import { ApiDocsController } from '../controllers/apiDocsController.js';
import { renderHomePage, renderModulePage } from '../docs/htmlRenderer.js';

const router = Router();
const controller = new ApiDocsController();

// API 接口（需要登录校验）
router.get('/docs', (req, res) => controller.summary(req, res));

// HTML 页面
router.get('/docs/ui', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderHomePage());
});

router.get('/docs/module/:moduleId', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderModulePage(req.params.moduleId));
});

export default router;

