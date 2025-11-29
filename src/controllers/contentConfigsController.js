import { ContentConfigsService } from '../services/contentConfigsService.js';
import { sendSuccess } from '../utils/responseHelpers.js';

/**
 * 内容配置管理控制器
 */
export class ContentConfigsController {
  constructor() {
    this.service = new ContentConfigsService();
  }

  async listContentConfigs(req, res) {
    try {
      const configs = await this.service.listContentConfigs();
      return sendSuccess(res, configs);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async createContentConfig(req, res) {
    try {
      const config = await this.service.createContentConfig(req.body);
      return sendSuccess(res, config, { statusCode: 201 });
    } catch (error) {
      const statusCode = error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async updateContentConfig(req, res) {
    try {
      const { id } = req.params;
      await this.service.updateContentConfig(id, req.body);
      const config = await this.service.findById(id);
      return sendSuccess(res, config);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 
                        error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async deleteContentConfig(req, res) {
    try {
      const { id } = req.params;
      await this.service.deleteContentConfig(id);
      return sendSuccess(res, { deleted: true });
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async getContentConfig(req, res) {
    try {
      const { id } = req.params;
      const config = await this.service.findById(id);
      if (!config) {
        return res.status(404).json({ error: '内容配置不存在', success: false });
      }
      return sendSuccess(res, config);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async toggleContentConfigStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (typeof status !== 'boolean') {
        return res.status(400).json({ error: '状态必须是布尔值', success: false });
      }

      const config = await this.service.toggleContentConfigStatus(id, status);
      return sendSuccess(res, config);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }
}

