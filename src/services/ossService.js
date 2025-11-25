import OSS from 'ali-oss';
import config from '../config/index.js';

export class OssService {
  constructor() {
    const { accessKeyId, accessKeySecret, bucket, region, endpoint, prefix = '' } = config.oss || {};

    if (!accessKeyId || !accessKeySecret) {
      throw new Error('未配置OSS访问密钥');
    }

    this.bucket = bucket;
    this.prefix = prefix.replace(/^\//, '').replace(/\/$/, '');

    this.client = new OSS({
      accessKeyId,
      accessKeySecret,
      bucket,
      region,
      endpoint,
      secure: true,
    });
  }

  buildObjectKey(filename) {
    if (!this.prefix) {
      return filename;
    }
    return `${this.prefix}/${filename}`;
  }

  async uploadZip(filename, buffer) {
    const objectKey = this.buildObjectKey(filename);
    await this.client.put(objectKey, buffer);
    const region = this.client.options.region;
    const host = `${this.bucket}.${region}.aliyuncs.com`;
    return {
      objectKey,
      url: `https://${host}/${objectKey}`,
    };
  }
}


