import { MongoClient } from 'mongodb';
import { DatabaseAdapter } from './base.js';

/**
 * MongoDB 数据库适配器
 */
export class MongoDBAdapter extends DatabaseAdapter {
  constructor(config) {
    super();
    this.config = config;
    this.client = null;
    this.db = null;
  }

  /**
   * 获取集合
   * @param {string} collection - 集合名称
   * @returns {Collection}
   */
  getCollection(collection) {
    if (!this.db) {
      throw new Error('数据库未连接，请先调用 connect() 方法');
    }
    return this.db.collection(collection);
  }

  async findOne(collection, query) {
    const coll = this.getCollection(collection);
    return coll.findOne(query);
  }

  async find(collection, query = {}, options = {}) {
    const coll = this.getCollection(collection);
    let cursor = coll.find(query);

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

    return cursor.toArray();
  }

  async insert(collection, doc) {
    const coll = this.getCollection(collection);
    const result = await coll.insertOne(doc);
    // 返回插入的文档，包含生成的_id
    const insertedDoc = await coll.findOne({ _id: result.insertedId });
    // 如果文档使用id字段而不是_id，需要转换
    if (insertedDoc && insertedDoc._id && doc.id) {
      return { ...insertedDoc, id: doc.id };
    }
    return insertedDoc || { ...doc, _id: result.insertedId };
  }

  async update(collection, query, update, options = {}) {
    const coll = this.getCollection(collection);
    const updateOptions = {
      upsert: options.upsert || false,
    };

    // 如果 update 对象不包含 $set 等操作符，则包装为 $set
    let updateDoc = update;
    if (!update.$set && !update.$unset && !update.$inc && !update.$push) {
      updateDoc = { $set: update };
    }

    const result = options.multi !== false
      ? await coll.updateMany(query, updateDoc, updateOptions)
      : await coll.updateOne(query, updateDoc, updateOptions);

    return result.modifiedCount || result.upsertedCount || 0;
  }

  async remove(collection, query, options = {}) {
    const coll = this.getCollection(collection);
    const result = options.multi !== false
      ? await coll.deleteMany(query)
      : await coll.deleteOne(query);

    return result.deletedCount || 0;
  }

  async count(collection, query = {}) {
    const coll = this.getCollection(collection);
    return coll.countDocuments(query);
  }

  async connect() {
    try {
      this.client = new MongoClient(this.config.mongodb.uri, this.config.mongodb.options);
      await this.client.connect();
      this.db = this.client.db(this.config.mongodb.dbName);
      console.log('MongoDB 连接成功');
      return this.db;
    } catch (error) {
      console.error('MongoDB 连接失败:', error);
      throw error;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('MongoDB 连接已关闭');
    }
  }
}

