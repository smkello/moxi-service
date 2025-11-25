import { BaseService } from './baseService.js';

/**
 * 行为管理服务
 */
export class BehaviorsService extends BaseService {
  constructor() {
    super('behaviors');
  }

  async listBehaviors(filter = {}) {
    const query = {};
    if (filter.projectId) {
      query.projectId = filter.projectId;
    } else if (filter.projectId === '') {
      query.projectId = { $in: [null, '', undefined] };
    }
    return this.find(query);
  }

  async createBehavior(data) {
    if (!data.id || !data.name || !data.code || !data.type || !data.logic) {
      throw new Error('行为ID、名称、编码、类型和逻辑不能为空');
    }

    const existing = await this.findOne({ code: data.code });
    if (existing) {
      throw new Error('行为编码已存在');
    }

    const behaviorData = {
      ...data,
      description: data.description || '',
      parameters: data.parameters || [],
      projectId: data.projectId || null,
    };

    return this.create(behaviorData);
  }

  async updateBehavior(id, data) {
    const behavior = await this.findById(id);
    if (!behavior) {
      throw new Error('行为不存在');
    }

    if (data.code && data.code !== behavior.code) {
      const existing = await this.findOne({ code: data.code });
      if (existing) {
        throw new Error('行为编码已存在');
      }
    }

    delete data.id;
    delete data.createdAt;

    return this.update(id, data);
  }

  async deleteBehavior(id) {
    const behavior = await this.findById(id);
    if (!behavior) {
      throw new Error('行为不存在');
    }

    return this.delete(id);
  }

  async getBehaviorByCode(code) {
    return this.findOne({ code });
  }
}

