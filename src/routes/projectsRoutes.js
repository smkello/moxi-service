import { Router } from 'express';
import { ProjectsController } from '../controllers/projectsController.js';

const router = Router();
const controller = new ProjectsController();

// 查询项目列表
router.get('/projects', (req, res) => controller.listProjects(req, res));

// 创建项目
router.post('/projects', (req, res) => controller.createProject(req, res));

// 更新项目
router.put('/projects/:id', (req, res) => controller.updateProject(req, res));

// 删除项目
router.delete('/projects/:id', (req, res) => controller.deleteProject(req, res));

// 切换项目状态
router.patch('/projects/:id/status', (req, res) => controller.toggleProjectStatus(req, res));

// 保存项目配置
router.put('/projects/:id/config/:language', (req, res) => controller.saveProjectConfig(req, res));

// 获取项目配置
router.get('/projects/:id/config/:language', (req, res) => controller.getProjectConfig(req, res));

// 保存项目JSON
router.put('/projects/:code/json', (req, res) => controller.saveProjectJson(req, res));

// 获取项目JSON
router.get('/projects/:code/json', (req, res) => controller.getProjectJson(req, res));

export default router;

