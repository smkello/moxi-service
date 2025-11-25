/**
 * 数据库适配器基类
 * 定义统一的数据库操作接口
 */
export class DatabaseAdapter {
  /**
   * 查找单个文档
   * @param {string} collection - 集合名称
   * @param {object} query - 查询条件
   * @returns {Promise<object|null>}
   */
  async findOne(collection, query) {
    throw new Error('findOne 方法必须在子类中实现');
  }

  /**
   * 查找多个文档
   * @param {string} collection - 集合名称
   * @param {object} query - 查询条件
   * @param {object} options - 查询选项（排序、分页等）
   * @returns {Promise<Array>}
   */
  async find(collection, query = {}, options = {}) {
    throw new Error('find 方法必须在子类中实现');
  }

  /**
   * 插入文档
   * @param {string} collection - 集合名称
   * @param {object} doc - 文档对象
   * @returns {Promise<object>}
   */
  async insert(collection, doc) {
    throw new Error('insert 方法必须在子类中实现');
  }

  /**
   * 更新文档
   * @param {string} collection - 集合名称
   * @param {object} query - 查询条件
   * @param {object} update - 更新内容
   * @param {object} options - 更新选项
   * @returns {Promise<number>} 更新的文档数量
   */
  async update(collection, query, update, options = {}) {
    throw new Error('update 方法必须在子类中实现');
  }

  /**
   * 删除文档
   * @param {string} collection - 集合名称
   * @param {object} query - 查询条件
   * @param {object} options - 删除选项
   * @returns {Promise<number>} 删除的文档数量
   */
  async remove(collection, query, options = {}) {
    throw new Error('remove 方法必须在子类中实现');
  }

  /**
   * 统计文档数量
   * @param {string} collection - 集合名称
   * @param {object} query - 查询条件
   * @returns {Promise<number>}
   */
  async count(collection, query = {}) {
    throw new Error('count 方法必须在子类中实现');
  }

  /**
   * 初始化数据库连接
   * @returns {Promise<void>}
   */
  async connect() {
    throw new Error('connect 方法必须在子类中实现');
  }

  /**
   * 关闭数据库连接
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error('close 方法必须在子类中实现');
  }
}

