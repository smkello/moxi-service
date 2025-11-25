import getDatabase from '../database/index.js';

/**
 * 基础服务类
 * 提供通用的 CRUD 操作方法
 * 支持用户数据隔离
 */
export class BaseService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.db = getDatabase();
    this.userId = null; // 当前用户ID，用于数据隔离
  }

  /**
   * 设置当前用户ID（用于数据隔离）
   * @param {string} userId - 用户ID
   */
  setUserId(userId) {
    this.userId = userId;
    return this;
  }

  /**
   * 获取带用户过滤的查询条件
   * @param {object} query - 原始查询条件
   * @returns {object} 带用户过滤的查询条件
   */
  getQueryWithUser(query = {}) {
    if (this.userId) {
      return { ...query, userId: this.userId };
    }
    return query;
  }

  /**
   * 查找单个文档
   * @param {object} query - 查询条件
   * @returns {Promise<object|null>}
   */
  async findOne(query) {
    const queryWithUser = this.getQueryWithUser(query);
    return this.db.findOne(this.collectionName, queryWithUser);
  }

  /**
   * 查找多个文档
   * @param {object} query - 查询条件
   * @param {object} options - 查询选项
   * @returns {Promise<Array>}
   */
  async find(query = {}, options = {}) {
    const queryWithUser = this.getQueryWithUser(query);
    return this.db.find(this.collectionName, queryWithUser, options);
  }

  /**
   * 根据 ID 查找文档
   * @param {string} id - 文档 ID
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return this.findOne({ id });
  }

  /**
   * 创建文档
   * @param {object} data - 文档数据
   * @returns {Promise<object>}
   */
  async create(data) {
    const now = new Date().toISOString();
    const doc = {
      ...data,
      userId: this.userId, // 自动添加用户ID
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    return this.db.insert(this.collectionName, doc);
  }

  /**
   * 更新文档
   * @param {string} id - 文档 ID
   * @param {object} data - 更新数据
   * @param {object} options - 更新选项
   * @returns {Promise<number>}
   */
  async update(id, data, options = {}) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    // 移除 id 和 userId 字段，避免更新
    delete updateData.id;
    delete updateData.userId;
    
    // 查询条件包含用户ID，确保只能更新自己的数据
    const query = this.getQueryWithUser({ id });
    
    return this.db.update(
      this.collectionName,
      query,
      updateData,
      { ...options, multi: false }
    );
  }

  /**
   * 删除文档
   * @param {string} id - 文档 ID
   * @returns {Promise<number>}
   */
  async delete(id) {
    // 查询条件包含用户ID，确保只能删除自己的数据
    const query = this.getQueryWithUser({ id });
    return this.db.remove(this.collectionName, query, { multi: false });
  }

  /**
   * 统计文档数量
   * @param {object} query - 查询条件
   * @returns {Promise<number>}
   */
  async count(query = {}) {
    const queryWithUser = this.getQueryWithUser(query);
    return this.db.count(this.collectionName, queryWithUser);
  }

  /**
   * 检查文档是否存在
   * @param {string} id - 文档 ID
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    const doc = await this.findById(id);
    return doc !== null;
  }

  /**
   * 根据 ID 查找文档（带用户过滤）
   * @param {string} id - 文档 ID
   * @param {boolean} checkOwnership - 是否检查所有权，默认true
   * @returns {Promise<object|null>}
   */
  async findByIdWithUser(id, checkOwnership = true) {
    if (checkOwnership && this.userId) {
      const doc = await this.findOne({ id });
      if (doc && doc.userId !== this.userId) {
        return null; // 不是自己的数据，返回null
      }
      return doc;
    }
    return this.findById(id);
  }
}

