import Datastore from 'nedb';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { DatabaseAdapter } from './base.js';

/**
 * NeDB 数据库适配器
 */
export class NeDBAdapter extends DatabaseAdapter {
  constructor(config) {
    super();
    this.config = config;
    this.datastores = new Map();
    this.dataDir = config.nedb.dataDir;
    
    // 确保数据目录存在
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * 获取或创建数据存储
   * @param {string} collection - 集合名称
   * @returns {Datastore}
   */
  getDatastore(collection) {
    if (!this.datastores.has(collection)) {
      const filePath = join(this.dataDir, `${collection}.db`);
      const datastore = new Datastore({ filename: filePath, autoload: true });
      this.datastores.set(collection, datastore);
    }
    return this.datastores.get(collection);
  }

  /**
   * 将 NeDB 回调转换为 Promise
   */
  promisify(datastore, method, ...args) {
    return new Promise((resolve, reject) => {
      datastore[method](...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async findOne(collection, query) {
    const datastore = this.getDatastore(collection);
    return this.promisify(datastore, 'findOne', query);
  }

  async find(collection, query = {}, options = {}) {
    const datastore = this.getDatastore(collection);
    let cursor = datastore.find(query);

    // 应用排序
    if (options.sort) {
      cursor = cursor.sort(options.sort);
    }

    // 应用分页
    if (options.skip) {
      cursor = cursor.skip(options.skip);
    }
    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }

    return this.promisify(cursor, 'exec');
  }

  async insert(collection, doc) {
    const datastore = this.getDatastore(collection);
    const result = await this.promisify(datastore, 'insert', doc);
    return result;
  }

  async update(collection, query, update, options = {}) {
    const datastore = this.getDatastore(collection);
    const updateOptions = {
      multi: options.multi !== false,
      upsert: options.upsert || false,
    };
    
    // NeDB 使用 $set 语法
    const updateDoc = { $set: update };
    
    return new Promise((resolve, reject) => {
      datastore.update(query, updateDoc, updateOptions, (err, numAffected) => {
        if (err) {
          reject(err);
        } else {
          resolve(numAffected);
        }
      });
    });
  }

  async remove(collection, query, options = {}) {
    const datastore = this.getDatastore(collection);
    const removeOptions = {
      multi: options.multi !== false,
    };
    
    return new Promise((resolve, reject) => {
      datastore.remove(query, removeOptions, (err, numRemoved) => {
        if (err) {
          reject(err);
        } else {
          resolve(numRemoved);
        }
      });
    });
  }

  async count(collection, query = {}) {
    const datastore = this.getDatastore(collection);
    return this.promisify(datastore, 'count', query);
  }

  async connect() {
    // NeDB 是文件数据库，无需连接
    return Promise.resolve();
  }

  async close() {
    // NeDB 无需关闭连接
    return Promise.resolve();
  }
}

