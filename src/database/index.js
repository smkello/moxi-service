import config from '../config/index.js';
import { NeDBAdapter } from './nedbAdapter.js';
import { MongoDBAdapter } from './mongoDbAdapter.js';

let dbAdapter = null;

/**
 * 获取数据库适配器实例（单例模式）
 * @returns {DatabaseAdapter}
 */
export function getDatabase() {
  if (!dbAdapter) {
    if (config.database.type === 'nedb') {
      dbAdapter = new NeDBAdapter(config.database);
    } else if (config.database.type === 'mongodb') {
      dbAdapter = new MongoDBAdapter(config.database);
    } else {
      throw new Error(`不支持的数据库类型: ${config.database.type}`);
    }
  }
  return dbAdapter;
}

/**
 * 初始化数据库连接
 */
export async function initDatabase() {
  const db = getDatabase();
  await db.connect();
  return db;
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase() {
  if (dbAdapter) {
    await dbAdapter.close();
    dbAdapter = null;
  }
}

export default getDatabase;

