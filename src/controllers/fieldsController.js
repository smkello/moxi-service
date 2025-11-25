import { FieldsService } from '../services/fieldsService.js';

export class FieldsController {
  constructor() {
    this.service = new FieldsService();
  }

  async listFields(req, res) {
    try {
      const fields = await this.service.listFields();
      return res.json(fields);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async createField(req, res) {
    try {
      const field = await this.service.createField(req.body);
      return res.status(201).json(field);
    } catch (error) {
      const statusCode = error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async updateField(req, res) {
    try {
      const { id } = req.params;
      await this.service.updateField(id, req.body);
      const field = await this.service.findById(id);
      return res.json(field);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 
                        error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async deleteField(req, res) {
    try {
      const { id } = req.params;
      await this.service.deleteField(id);
      return res.json({ success: true });
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async toggleFieldStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (typeof status !== 'boolean') {
        return res.status(400).json({ error: '状态必须是布尔值', success: false });
      }

      const field = await this.service.toggleFieldStatus(id, status);
      return res.json(field);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }
}

