import { randomUUID } from 'crypto';
import { BaseService } from './baseService.js';

/**
 * 内容配置管理服务
 */
export class ContentConfigsService extends BaseService {
  constructor() {
    super('contentConfigs');
  }

  /**
   * 查询内容配置列表
   */
  async listContentConfigs(query = {}, options = {}) {
    return this.find(query, options);
  }

  /**
   * 创建内容配置
   */
  async createContentConfig(data) {
    if (!data.code || !data.name) {
      throw new Error('编码和名称不能为空');
    }

    // 检查编码是否已存在
    const existing = await this.findOne({ code: data.code });
    if (existing) {
      throw new Error('内容配置编码已存在');
    }

    const configId = randomUUID();
    const configData = {
      ...data,
      status: data.status !== undefined ? data.status : false,
      tabs: data.tabs || [],
      description: data.description || '',
      id: configId,
      _id: configId,
    };

    return this.create(configData);
  }

  /**
   * 更新内容配置
   */
  async updateContentConfig(id, data) {
    const config = await this.findById(id);
    if (!config) {
      throw new Error('内容配置不存在');
    }

    if (data.code && data.code !== config.code) {
      const existing = await this.findOne({ code: data.code });
      if (existing) {
        throw new Error('内容配置编码已存在');
      }
    }

    delete data.id;
    delete data.createdAt;

    return this.update(id, data);
  }

  /**
   * 删除内容配置
   */
  async deleteContentConfig(id) {
    const config = await this.findById(id);
    if (!config) {
      throw new Error('内容配置不存在');
    }

    return this.delete(id);
  }

  /**
   * 切换内容配置状态
   */
  async toggleContentConfigStatus(id, status) {
    const config = await this.findById(id);
    if (!config) {
      throw new Error('内容配置不存在');
    }

    await this.update(id, { status });
    return this.findById(id);
  }
}

