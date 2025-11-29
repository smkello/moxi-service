import { randomUUID } from 'crypto';
import { BaseService } from './baseService.js';

/**
 * 字段管理服务
 */
export class FieldsService extends BaseService {
  constructor() {
    super('fields');
  }

  async listFields(query = {}, options = {}) {
    return this.find(query, options);
  }

  async createField(data) {
    if ( !data.code || !data.name) {
      throw new Error('编码和名称不能为空');
    }

    const existing = await this.findOne({ code: data.code });
    if (existing) {
      throw new Error('字段编码已存在');
    }

    const fieldId = randomUUID();
    const fieldData = {
      ...data,
      status: data.status !== undefined ? data.status : false,
      description: data.description || '',
      id: fieldId,
      _id: fieldId,
    };

    return this.create(fieldData);
  }

  async updateField(id, data) {
    const field = await this.findById(id);
    if (!field) {
      throw new Error('字段不存在');
    }

    if (data.code && data.code !== field.code) {
      const existing = await this.findOne({ code: data.code });
      if (existing) {
        throw new Error('字段编码已存在');
      }
    }

    delete data.id;
    delete data.createdAt;

    return this.update(id, data);
  }

  async deleteField(id) {
    const field = await this.findById(id);
    if (!field) {
      throw new Error('字段不存在');
    }

    return this.delete(id);
  }

  async toggleFieldStatus(id, status) {
    const field = await this.findById(id);
    if (!field) {
      throw new Error('字段不存在');
    }

    await this.update(id, { status });
    return this.findById(id);
  }
}

