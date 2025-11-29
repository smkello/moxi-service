import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../');

// 当前环境
const currentEnv = process.env.APP_ENV || process.env.NODE_ENV || 'development';

// 依次加载通用和环境专属配置文件，后加载的可覆盖前者
const envFiles = [
  '.env',
  `.env.${currentEnv}`,
  `.env.${currentEnv}.local`,
  join('env', 'base.env'),
  join('env', `${currentEnv}.env`),
  join('env', `${currentEnv}.local.env`),
];

envFiles.forEach((file) => {
  const path = file.startsWith(rootDir) ? file : join(rootDir, file);
  if (existsSync(path)) {
    dotenv.config({ path, override: true });
  }
});

const config = {
  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: currentEnv,
    debug: process.env.DEBUG === 'true' || process.env.DEBUG === '1',
  },

  // 数据库配置
  database: {
    type: process.env.DB_TYPE || 'nedb', // 'nedb' 或 'mongodb'
    nedb: {
      dataDir: process.env.NEDB_DATA_DIR || './data',
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_DB_NAME || 'content_management',
      options: {
        // MongoDB 连接选项
      },
    },
  },

  // OSS 配置
  oss: {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || 'LTAI5tKpHRaQbDwUkjNSnkVp',
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || 'oQVXOPVV6Hk21Vc7PmBw7HoX0umHOI',
    bucket: process.env.OSS_BUCKET || 'dynamic-web',
    region: process.env.OSS_REGION || 'oss-cn-shanghai',
    endpoint: process.env.OSS_ENDPOINT || 'https://oss-cn-shanghai.aliyuncs.com',
    prefix: process.env.OSS_PREFIX || '',
  },

  // SDK配置
  sdk: {
    heartbeat: {
      // 心跳间隔（毫秒），默认30秒
      interval: parseInt(process.env.SDK_HEARTBEAT_INTERVAL || '30000', 10),
      // 自定义密钥（可选，不提供则使用SDK默认密钥）
      secret: process.env.SDK_HEARTBEAT_SECRET || undefined,
      // 是否启用异常计数
      enableErrorCount: process.env.SDK_HEARTBEAT_ENABLE_ERROR_COUNT !== 'false',
      // 最大错误次数，达到此次数后标记为异常
      maxErrorCount: parseInt(process.env.SDK_HEARTBEAT_MAX_ERROR_COUNT || '3', 10),
      // 是否启用自动清理（超过2倍间隔未更新自动注销），默认true
      enableAutoCleanup: process.env.SDK_HEARTBEAT_ENABLE_AUTO_CLEANUP !== 'false',
      // 是否强制检查（所有接口都需要验证心跳），默认false
      forceCheck: process.env.SDK_HEARTBEAT_FORCE_CHECK === 'true',
    },
  },
};

// 验证配置
if (!['nedb', 'mongodb'].includes(config.database.type)) {
  throw new Error(`不支持的数据库类型: ${config.database.type}。请使用 'nedb' 或 'mongodb'`);
}

export default config;

