import { BaseService } from './baseService.js';

/**
 * 数据源管理服务
 */
export class DatasourcesService extends BaseService {
  constructor() {
    super('datasources');
  }

  async listDatasources(filter = {}) {
    const query = {};
    if (filter.projectId) {
      query.projectId = filter.projectId;
    } else if (filter.projectId === '') {
      query.projectId = { $in: [null, '', undefined] };
    }
    return this.find(query);
  }

  async createDatasource(payload) {
    const data = this.normalizeDatasourcePayload(payload);

    if (!data.id || !data.name || !data.code || !data.type) {
      throw new Error('数据源ID、名称、编码和类型不能为空');
    }

    const existing = await this.findOne({ code: data.code });
    if (existing) {
      throw new Error('数据源编码已存在');
    }

    return this.create(data);
  }

  async updateDatasource(id, payload) {
    const datasource = await this.findById(id);
    if (!datasource) {
      throw new Error('数据源不存在');
    }

    const data = this.normalizeDatasourcePayload(payload, { isUpdate: true });

    if (data.code && data.code !== datasource.code) {
      const existing = await this.findOne({ code: data.code });
      if (existing) {
        throw new Error('数据源编码已存在');
      }
    }

    delete data.id;
    delete data.createdAt;

    return this.update(id, data);
  }

  async deleteDatasource(id) {
    const datasource = await this.findById(id);
    if (!datasource) {
      throw new Error('数据源不存在');
    }

    return this.delete(id);
  }

  async getDatasourceByCode(code) {
    return this.findOne({ code });
  }

  async testDatasource(payload) {
    const datasource = this.normalizeDatasourcePayload(payload);
    if (!datasource.type) {
      throw new Error('必须提供数据源类型');
    }

    if (datasource.type === 'remote') {
      await this.performRemoteRequest(datasource);
    }

    const data = datasource.type === 'local'
      ? datasource.config?.localData || []
      : [];

    return {
      success: true,
      data: this.applyMapping(data, datasource.mapping),
    };
  }

  async fetchDatasourceData(id) {
    const datasource = await this.findById(id);
    if (!datasource) {
      throw new Error('数据源不存在');
    }

    if (datasource.type === 'local') {
      const data = datasource.config?.localData || [];
      return this.applyMapping(data, datasource.mapping);
    }

    const remoteData = await this.performRemoteRequest(datasource);
    return this.applyMapping(remoteData, datasource.mapping);
  }

  normalizeDatasourcePayload(payload, options = {}) {
    if (!payload) {
      throw new Error('数据源定义不能为空');
    }

    const data = payload.datasource ? payload.datasource : payload;
    const projectId = payload.projectId ?? data.projectId ?? null;

    const normalized = {
      ...data,
      projectId,
      description: data.description || '',
      config: data.config || {},
      mapping: Array.isArray(data.mapping) ? data.mapping : [],
    };

    if (!options.isUpdate) {
      normalized.config.cacheEnabled = normalized.config.cacheEnabled ?? false;
      normalized.config.cacheDuration = normalized.config.cacheDuration ?? 0;
    }

    return normalized;
  }

  async performRemoteRequest(datasource) {
    const { config } = datasource;
    if (!config || !config.apiUrl) {
      throw new Error('远程数据源缺少 apiUrl 配置');
    }

    const headers = { 'Content-Type': 'application/json', ...(config.headers || {}) };
    let tokenValue;

    if (config.requiresToken) {
      if (!config.tokenApi || !config.tokenField) {
        throw new Error('远程数据源缺少 Token 配置');
      }
      const tokenResponse = await fetch(config.tokenApi, {
        method: 'POST',
        headers,
        body: config.tokenBody || '',
      });
      if (!tokenResponse.ok) {
        throw new Error('获取 Token 失败');
      }
      const tokenJson = await tokenResponse.json();
      tokenValue = tokenJson[config.tokenField];
      if (!tokenValue) {
        throw new Error('Token 响应中缺少指定字段');
      }
      headers.Authorization = config.tokenType
        ? `${config.tokenType} ${tokenValue}`
        : tokenValue;
    }

    const url = new URL(config.apiUrl);
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      });
    }

    const requestInit = {
      method: (config.method || 'GET').toUpperCase(),
      headers,
    };

    if (config.body && requestInit.method !== 'GET') {
      requestInit.body = typeof config.body === 'string'
        ? config.body
        : JSON.stringify(config.body);
    }

    const response = await fetch(url, requestInit);
    if (!response.ok) {
      throw new Error(`远程数据源请求失败: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await response.json();
      if (Array.isArray(json)) {
        return json;
      }
      if (Array.isArray(json.data)) {
        return json.data;
      }
      if (Array.isArray(json.items)) {
        return json.items;
      }
      return [json];
    }

    const text = await response.text();
    return [text];
  }

  applyMapping(data, mapping) {
    if (!mapping || mapping.length === 0) {
      return data;
    }

    const rows = Array.isArray(data) ? data : [data];
    return rows.map((row) => {
      return mapping.reduce((acc, mapItem) => {
        const value = row?.[mapItem.sourceField];
        acc[mapItem.targetField || mapItem.sourceField] = value ?? mapItem.defaultValue ?? null;
        return acc;
      }, {});
    });
  }
}

