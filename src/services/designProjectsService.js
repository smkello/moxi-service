import { BaseService } from './baseService.js';

/**
 * 设计项目管理服务
 */
export class DesignProjectsService extends BaseService {
  constructor() {
    super('designProjects');
  }

  async listDesignProjects(query = {}, options = {}) {
    return this.find(query, options);
  }

  async createDesignProject(data) {
    if (!data.id || !data.code || !data.name) {
      throw new Error('设计项目ID、编码和名称不能为空');
    }

    const existing = await this.findOne({ code: data.code });
    if (existing) {
      throw new Error('设计项目编码已存在');
    }

    const projectData = {
      ...data,
      description: data.description || '',
      datasources: data.datasources || [],
      behaviors: data.behaviors || [],
      pages: data.pages || [],
    };

    return this.create(projectData);
  }

  async updateDesignProject(id, data) {
    const project = await this.findById(id);
    if (!project) {
      throw new Error('设计项目不存在');
    }

    if (data.code && data.code !== project.code) {
      const existing = await this.findOne({ code: data.code });
      if (existing) {
        throw new Error('设计项目编码已存在');
      }
    }

    delete data.id;
    delete data.createdAt;

    return this.update(id, data);
  }

  async deleteDesignProject(id) {
    const project = await this.findById(id);
    if (!project) {
      throw new Error('设计项目不存在');
    }

    return this.delete(id);
  }
}

