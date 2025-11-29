import { ElementsService } from '../services/elementsService.js';
import { sendSuccess } from '../utils/responseHelpers.js';

export class ElementsController {
  constructor() {
    this.service = new ElementsService();
  }

  async listElements(req, res) {
    try {
      const elements = await this.service.listElements();
      return sendSuccess(res, elements);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async createElement(req, res) {
    try {
      const element = await this.service.createElement(req.body);
      return sendSuccess(res, element, { statusCode: 201 });
    } catch (error) {
      const statusCode = error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async updateElement(req, res) {
    try {
      const { id } = req.params;
      await this.service.updateElement(id, req.body);
      const element = await this.service.findById(id);
      return sendSuccess(res, element);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 
                        error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async deleteElement(req, res) {
    try {
      const { id } = req.params;
      await this.service.deleteElement(id);
      return sendSuccess(res, { deleted: true });
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async updateElementOptions(req, res) {
    try {
      const { id } = req.params;
      const element = await this.service.updateElementOptions(id, req.body);
      return sendSuccess(res, element);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }
}

