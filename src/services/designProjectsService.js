import { BaseService } from './baseService.js';

const CODE_PATTERN = /^[A-Za-z_]+$/;
const DUPLICATED_CODE_ERROR = '项目编码已存在，请换一个编码';

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

    this.validateProjectCodeFormat(data.code);
    await this.ensureGlobalCodeUnique(data.code);

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
      this.validateProjectCodeFormat(data.code);
      await this.ensureGlobalCodeUnique(data.code, project.id);
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

  validateProjectCodeFormat(code) {
    if (!CODE_PATTERN.test(code)) {
      throw new Error('项目编码必须由字母和下划线组成');
    }
  }

  async ensureGlobalCodeUnique(code, currentDesignProjectId = null) {
    const [designProject, project] = await Promise.all([
      this.db.findOne(this.collectionName, { code }),
      this.db.findOne('projects', { code }),
    ]);

    const conflictWithinDesignProjects = designProject
      && designProject.id !== currentDesignProjectId;

    if (conflictWithinDesignProjects || project) {
      throw new Error(DUPLICATED_CODE_ERROR);
    }
  }
}

