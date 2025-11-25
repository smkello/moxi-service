import { ProjectsService } from '../services/projectsService.js';

/**
 * 对外 Open API 控制器
 * 主要提供项目 JSON 及语言配置的读取能力
 */
export class OpenApiController {
  constructor() {
    this.projectsService = new ProjectsService();
  }

  /**
   * 获取项目 JSON 数据
   * @route GET /open-api/projects/:code/json
   */
  async getProjectJson(req, res) {
    try {
      const { code } = req.params;
      const json = await this.projectsService.getProjectJson(code);

      return res.json({
        success: true,
        code,
        data: json,
      });
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * 获取项目配置（可选指定语言）
   * @route GET /open-api/projects/:code/configs
   * @route GET /open-api/projects/:code/configs/:language
   */
  async getProjectConfigs(req, res) {
    try {
      const { code, language } = req.params;
      const config = await this.projectsService.getProjectConfigByCode(code, language);

      return res.json({
        success: true,
        code,
        language: language || null,
        data: config,
      });
    } catch (error) {
      const notFound = error.message.includes('不存在') || error.message.includes('未找到语言配置');
      const statusCode = notFound ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }
}


