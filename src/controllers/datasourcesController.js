import { DatasourcesService } from '../services/datasourcesService.js';
import { sendSuccess } from '../utils/responseHelpers.js';

export class DatasourcesController {
  constructor() {
    this.service = new DatasourcesService();
  }

  async listDatasources(req, res) {
    try {
      const datasources = await this.service.listDatasources({ projectId: req.query.projectId });
      return sendSuccess(res, datasources);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async createDatasource(req, res) {
    try {
      const datasource = await this.service.createDatasource(req.body);
      return sendSuccess(res, datasource, { statusCode: 201 });
    } catch (error) {
      const statusCode = error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async updateDatasource(req, res) {
    try {
      const { id } = req.params;
      await this.service.updateDatasource(id, req.body);
      const datasource = await this.service.findById(id);
      return sendSuccess(res, datasource);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 :
                        error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async deleteDatasource(req, res) {
    try {
      const { id } = req.params;
      await this.service.deleteDatasource(id);
      return sendSuccess(res, { deleted: true });
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async getDatasource(req, res) {
    try {
      const { id } = req.params;
      const datasource = await this.service.findById(id);
      if (!datasource) {
        return res.status(404).json({ error: '数据源不存在', success: false });
      }
      return sendSuccess(res, datasource);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async getDatasourceByCode(req, res) {
    try {
      const { code } = req.params;
      const datasource = await this.service.getDatasourceByCode(code);
      if (!datasource) {
        return res.status(404).json({ error: '数据源不存在', success: false });
      }
      return sendSuccess(res, datasource);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async testDatasource(req, res) {
    try {
      const result = await this.service.testDatasource(req.body);
      const payload = result?.data ?? result;
      return sendSuccess(res, payload);
    } catch (error) {
      return res.status(400).json({ error: error.message, success: false });
    }
  }

  async fetchDatasourceData(req, res) {
    try {
      const { id } = req.params;
      const data = await this.service.fetchDatasourceData(id);
      return sendSuccess(res, data);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }
}

