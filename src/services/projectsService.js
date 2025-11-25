import { BaseService } from './baseService.js';

/**
 * 项目管理服务
 */
export class ProjectsService extends BaseService {
  constructor() {
    super('projects');
  }

  /**
   * 查询项目列表
   * @param {object} query - 查询条件
   * @param {object} options - 查询选项
   * @returns {Promise<Array>}
   */
  async listProjects(query = {}, options = {}) {
    // 可以添加业务逻辑，如按状态过滤、排序等
    return this.find(query, options);
  }

  /**
   * 创建项目
   * @param {object} data - 项目数据
   * @returns {Promise<object>}
   */
  async createProject(data) {
    // 验证必填字段
    if (!data.id || !data.code || !data.name) {
      throw new Error('项目ID、编码和名称不能为空');
    }

    // 检查编码是否已存在
    const existing = await this.findOne({ code: data.code });
    if (existing) {
      throw new Error('项目编码已存在');
    }

    // 设置默认值
    const projectData = {
      ...data,
      languages: data.languages || [],
      status: data.status !== undefined ? data.status : false,
      contentConfigs: data.contentConfigs || [],
      description: data.description || '',
    };

    return this.create(projectData);
  }

  /**
   * 更新项目
   * @param {string} id - 项目ID
   * @param {object} data - 更新数据
   * @returns {Promise<number>}
   */
  async updateProject(id, data) {
    const project = await this.findById(id);
    if (!project) {
      throw new Error('项目不存在');
    }

    // 如果更新编码，检查是否冲突
    if (data.code && data.code !== project.code) {
      const existing = await this.findOne({ code: data.code });
      if (existing) {
        throw new Error('项目编码已存在');
      }
    }

    // 移除不允许更新的字段
    delete data.id;
    delete data.createdAt;

    return this.update(id, data);
  }

  /**
   * 删除项目
   * @param {string} id - 项目ID
   * @returns {Promise<number>}
   */
  async deleteProject(id) {
    const project = await this.findById(id);
    if (!project) {
      throw new Error('项目不存在');
    }

    return this.delete(id);
  }

  /**
   * 切换项目状态
   * @param {string} id - 项目ID
   * @param {boolean} status - 目标状态
   * @returns {Promise<object>}
   */
  async toggleProjectStatus(id, status) {
    const project = await this.findById(id);
    if (!project) {
      throw new Error('项目不存在');
    }

    await this.update(id, { status });
    return this.findById(id);
  }

  /**
   * 保存项目配置
   * @param {string} id - 项目ID
   * @param {string} language - 语言编码
   * @param {object} configData - 配置数据
   * @returns {Promise<object>}
   */
  async saveProjectConfig(id, language, configData) {
    const project = await this.findById(id);
    if (!project) {
      throw new Error('项目不存在');
    }

    // 验证语言是否在支持列表中
    if (!project.languages.includes(language)) {
      throw new Error(`项目不支持语言: ${language}`);
    }

    // 保存配置
    const configs = project.configs || {};
    configs[language] = configData;

    await this.update(id, { configs });
    return configs[language] || {};
  }

  /**
   * 获取项目配置
   * @param {string} id - 项目ID
   * @param {string} language - 语言编码
   * @returns {Promise<object>}
   */
  async getProjectConfig(id, language) {
    const project = await this.findById(id);
    if (!project) {
      throw new Error('项目不存在');
    }

    const configs = project.configs || {};
    return configs[language] || {};
  }

  /**
   * 保存项目JSON
   * @param {string} code - 项目编码
   * @param {object} jsonData - JSON数据
   * @returns {Promise<object>}
   */
  async saveProjectJson(code, jsonData) {
    const project = await this.findOne({ code });
    if (!project) {
      throw new Error('项目不存在');
    }

    await this.update(project.id, { json: jsonData });
    const updated = await this.findById(project.id);
    return updated.json || {};
  }

  /**
   * 获取项目JSON
   * 将项目基本信息（code, name, description, languages, status）和配置数据（configs）组合成标准格式
   * @param {string} code - 项目编码
   * @returns {Promise<object>}
   */
  async getProjectJson(code) {
    const project = await this.findOne({ code });
    if (!project) {
      throw new Error('项目不存在');
    }

    // 如果项目有保存的 json 字段，优先使用（向后兼容）
    if (project.json && Object.keys(project.json).length > 0) {
      return project.json;
    }

    // 否则，从项目基本信息和配置数据组合生成
    return {
      code: project.code,
      name: project.name,
      description: project.description || '',
      languages: project.languages || [],
      status: project.status !== undefined ? project.status : false,
      configData: project.configs || {},
    };
  }

  /**
   * 获取项目全部语言配置
   * @param {string} code - 项目编码
   * @returns {Promise<object>}
   */
  async getProjectConfigsByCode(code) {
    const project = await this.findOne({ code });
    if (!project) {
      throw new Error('项目不存在');
    }

    return project.configs || {};
  }

  /**
   * 根据项目编码和语言获取配置
   * @param {string} code - 项目编码
   * @param {string} [language] - 语言编码，可选
   * @returns {Promise<object>}
   */
  async getProjectConfigByCode(code, language) {
    const configs = await this.getProjectConfigsByCode(code);

    if (!language) {
      return configs;
    }

    const config = configs[language];
    if (!config) {
      throw new Error(`未找到语言配置: ${language}`);
    }

    return config;
  }
}

