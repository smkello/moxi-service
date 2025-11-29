import { ProjectsService } from '../services/projectsService.js';
import { BaseController } from './baseController.js';
import { sendSuccess } from '../utils/responseHelpers.js';

/**
 * 项目管理控制器
 */
export class ProjectsController extends BaseController {
  constructor() {
    const service = new ProjectsService();
    super(service);
  }

  /**
   * 查询项目列表
   */
  async listProjects(req, res) {
    try {
      this.setUserFromRequest(req);
      const projects = await this.service.listProjects();
      return sendSuccess(res, projects);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  /**
   * 创建项目
   */
  async createProject(req, res) {
    try {
      this.setUserFromRequest(req);
      const project = await this.service.createProject(req.body);
      return sendSuccess(res, project, { statusCode: 201 });
    } catch (error) {
      const statusCode = error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  /**
   * 更新项目
   */
  async updateProject(req, res) {
    try {
      this.setUserFromRequest(req);
      const { id } = req.params;
      await this.service.updateProject(id, req.body);
      const project = await this.service.findById(id);
      return sendSuccess(res, project);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 
                        error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(req, res) {
    try {
      this.setUserFromRequest(req);
      const { id } = req.params;
      await this.service.deleteProject(id);
      return sendSuccess(res, { deleted: true });
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  /**
   * 切换项目状态
   */
  async toggleProjectStatus(req, res) {
    try {
      this.setUserFromRequest(req);
      const { id } = req.params;
      const { status } = req.body;
      
      if (typeof status !== 'boolean') {
        return res.status(400).json({ error: '状态必须是布尔值', success: false });
      }

      const project = await this.service.toggleProjectStatus(id, status);
      return sendSuccess(res, project);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  /**
   * 保存项目配置
   */
  async saveProjectConfig(req, res) {
    try {
      this.setUserFromRequest(req);
      const { id, language } = req.params;
      const config = await this.service.saveProjectConfig(id, language, req.body);
      return sendSuccess(res, config);
    } catch (error) {
      const statusCode = error.message.includes('不存在') || error.message.includes('不支持') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  /**
   * 获取项目配置
   */
  async getProjectConfig(req, res) {
    try {
      this.setUserFromRequest(req);
      const { id, language } = req.params;
      const config = await this.service.getProjectConfig(id, language);
      return sendSuccess(res, config);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  /**
   * 保存项目JSON
   */
  async saveProjectJson(req, res) {
    try {
      this.setUserFromRequest(req);
      const { code } = req.params;
      const json = await this.service.saveProjectJson(code, req.body);
      return sendSuccess(res, json);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  /**
   * 获取项目JSON
   */
  async getProjectJson(req, res) {
    try {
      this.setUserFromRequest(req);
      const { code } = req.params;
      const json = await this.service.getProjectJson(code);
      return sendSuccess(res, json);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }
}

