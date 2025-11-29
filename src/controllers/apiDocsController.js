import { ApiDocsService } from '../services/apiDocsService.js';
import { sendSuccess } from '../utils/responseHelpers.js';

export class ApiDocsController {
  constructor() {
    this.service = new ApiDocsService();
  }

  async summary(req, res) {
    try {
      const data = this.service.getSummary();
      return sendSuccess(res, data);
    } catch (error) {
      res.status(500).json({ error: error.message, success: false });
    }
  }

  async exportAll(req, res) {
    try {
      const format = (req.query.format || 'json').toLowerCase();
      const data = this.service.exportAll(format);
      this.respondWithFormat(res, data, format, `cms-api-all.${this.getExt(format)}`);
    } catch (error) {
      res.status(400).json({ error: error.message, success: false });
    }
  }

  async exportModule(req, res) {
    try {
      const format = (req.query.format || 'json').toLowerCase();
      const { moduleId } = req.params;
      const data = this.service.exportModule(moduleId, format);
      this.respondWithFormat(res, data, format, `cms-api-${moduleId}.${this.getExt(format)}`);
    } catch (error) {
      const status = error.message.includes('不存在') ? 404 : 400;
      res.status(status).json({ error: error.message, success: false });
    }
  }

  async exportEndpoint(req, res) {
    try {
      const format = (req.query.format || 'json').toLowerCase();
      const { moduleId, endpointId } = req.params;
      const data = this.service.exportEndpoint(moduleId, endpointId, format);
      this.respondWithFormat(res, data, format, `cms-api-${moduleId}-${endpointId}.${this.getExt(format)}`);
    } catch (error) {
      const status = error.message.includes('不存在') ? 404 : 400;
      res.status(status).json({ error: error.message, success: false });
    }
  }

  respondWithFormat(res, data, format, filename) {
    if (format === 'markdown') {
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.send(data.markdown);
      return;
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
    res.json(data);
  }

  getExt(format) {
    switch (format) {
      case 'json':
        return 'json';
      case 'postman':
        return 'postman.json';
      case 'markdown':
        return 'md';
      case 'openapi':
        return 'openapi.json';
      default:
        return 'json';
    }
  }
}

