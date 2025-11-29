import { Router } from 'express';
import { ApiDocsController } from '../controllers/apiDocsController.js';

const router = Router();
const controller = new ApiDocsController();

// 导出接口（不需要登录校验）
router.get('/docs/export', (req, res) => controller.exportAll(req, res));
router.get('/docs/module/:moduleId/export', (req, res) => controller.exportModule(req, res));
router.get('/docs/endpoint/:moduleId/:endpointId/export', (req, res) => controller.exportEndpoint(req, res));

export default router;

