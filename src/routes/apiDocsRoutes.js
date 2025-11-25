import { Router } from 'express';
import { ApiDocsController } from '../controllers/apiDocsController.js';
import { renderHomePage, renderModulePage } from '../docs/htmlRenderer.js';

const router = Router();
const controller = new ApiDocsController();

// API 接口
router.get('/docs', (req, res) => controller.summary(req, res));
router.get('/docs/export', (req, res) => controller.exportAll(req, res));
router.get('/docs/module/:moduleId/export', (req, res) => controller.exportModule(req, res));
router.get('/docs/endpoint/:moduleId/:endpointId/export', (req, res) => controller.exportEndpoint(req, res));

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

