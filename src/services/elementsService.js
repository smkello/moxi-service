import { randomUUID } from 'crypto';
import { BaseService } from './baseService.js';

/**
 * 元素管理服务
 */
export class ElementsService extends BaseService {
  constructor() {
    super('elements');
  }

  async listElements(query = {}, options = {}) {
    return this.find(query, options);
  }

  async createElement(data) {
    if ( !data.code || !data.name) {
      throw new Error('编码和名称不能为空');
    }

    const existing = await this.findOne({ code: data.code });
    if (existing) {
      throw new Error('元素编码已存在');
    }

    const elementId = randomUUID();
    const elementData = {
      ...data,
      description: data.description || '',
      inputRegex: data.inputRegex || '',
      useOptions: data.useOptions ?? false,
      useDict: data.useDict ?? false,
      style: data.style || '',
      script: data.script || '',
      isSystem: data.isSystem ?? false,
      id: elementId,
      _id: elementId,
    };

    return this.create(elementData);
  }

  async updateElement(id, data) {
    const element = await this.findById(id);
    if (!element) {
      throw new Error('元素不存在');
    }

    if (data.code && data.code !== element.code) {
      const existing = await this.findOne({ code: data.code });
      if (existing) {
        throw new Error('元素编码已存在');
      }
    }

    delete data.id;
    delete data.createdAt;

    return this.update(id, data);
  }

  async deleteElement(id) {
    const element = await this.findById(id);
    if (!element) {
      throw new Error('元素不存在');
    }

    return this.delete(id);
  }

  async updateElementOptions(id, payload) {
    const element = await this.findById(id);
    if (!element) {
      throw new Error('元素不存在');
    }

    const updates = {};
    if (payload.useOptions !== undefined) {
      updates.useOptions = payload.useOptions;
    }
    if (payload.useDict !== undefined) {
      updates.useDict = payload.useDict;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('未提供可更新的配置字段');
    }

    await this.update(id, updates);
    return this.findById(id);
  }
}

