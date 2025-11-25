import { Router } from 'express';
import { OpenApiController } from '../controllers/openApiController.js';

const router = Router();
const controller = new OpenApiController();

// 获取项目 JSON
router.get('/projects/:code/json', (req, res) => controller.getProjectJson(req, res));

// 获取项目全部语言配置
router.get('/projects/:code/configs', (req, res) => controller.getProjectConfigs(req, res));

// 获取项目指定语言配置
router.get('/projects/:code/configs/:language', (req, res) => controller.getProjectConfigs(req, res));

export default router;


