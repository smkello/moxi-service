import { DesignProjectsService } from '../services/designProjectsService.js';
import { OssService } from '../services/ossService.js';

export class DesignProjectsController {
  constructor() {
    this.service = new DesignProjectsService();
    this.ossService = null;
  }

  getOssService() {
    if (!this.ossService) {
      this.ossService = new OssService();
    }
    return this.ossService;
  }

  async listDesignProjects(req, res) {
    try {
      const projects = await this.service.listDesignProjects();
      return res.json(projects);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async createDesignProject(req, res) {
    try {
      const project = await this.service.createDesignProject(req.body);
      return res.status(201).json(project);
    } catch (error) {
      const statusCode = error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async updateDesignProject(req, res) {
    try {
      const { id } = req.params;
      await this.service.updateDesignProject(id, req.body);
      const project = await this.service.findById(id);
      return res.json(project);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 :
                        error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async deleteDesignProject(req, res) {
    try {
      const { id } = req.params;
      await this.service.deleteDesignProject(id);
      return res.json({ success: true });
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async getDesignProject(req, res) {
    try {
      const { id } = req.params;
      const project = await this.service.findById(id);
      if (!project) {
        return res.status(404).json({ error: '设计项目不存在', success: false });
      }
      return res.json(project);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async uploadDesignProjectPackage(req, res) {
    const projectId = req.body.projectId || req.body.project_id;
    const projectCode = req.body.projectCode || req.body.project_code;

    if (!projectId || !projectCode) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PARAMS',
        message: '项目ID和项目编码不能为空',
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        code: 'FILE_REQUIRED',
        message: '请上传zip文件',
      });
    }

    try {
      const project = await this.service.findById(projectId);
      if (!project) {
        return res.status(200).json({
          success: false,
          code: 'PROJECT_NOT_FOUND',
          message: '项目不存在或已删除',
        });
      }

      if (project.code !== projectCode) {
        return res.status(200).json({
          success: false,
          code: 'PROJECT_CODE_MISMATCH',
          message: '传入的项目编码与数据库不一致',
        });
      }

      const filename = `${projectCode}.zip`;
      const ossService = this.getOssService();
      const result = await ossService.uploadZip(filename, req.file.buffer);

      return res.json({
        success: true,
        code: 'UPLOAD_SUCCESS',
        message: '文件上传成功',
        data: {
          projectId,
          projectCode,
          objectKey: result.objectKey,
          url: result.url,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        code: 'OSS_UPLOAD_FAILED',
        message: `上传失败: ${error.message}`,
      });
    }
  }
}

