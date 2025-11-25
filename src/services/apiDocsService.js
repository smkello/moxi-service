import { loadApiDoc, getModules, getModuleById, getEndpoint } from '../docs/apiDocLoader.js';

const SUPPORTED_FORMATS = ['json', 'postman', 'markdown', 'openapi'];

export class ApiDocsService {
  getSummary() {
    const doc = loadApiDoc();
    const modules = getModules().map((module) => ({
      id: module.id,
      name: module.name,
      description: module.description,
      endpointCount: module.endpoints?.length || 0,
      tags: module.tags || [],
    }));
    return {
      generatedAt: doc.generatedAt,
      moduleCount: modules.length,
      modules,
    };
  }

  exportAll(format = 'json') {
    this.ensureFormat(format);
    const modules = getModules();
    return this.formatData(format, modules);
  }

  exportModule(moduleId, format = 'json') {
    this.ensureFormat(format);
    const module = getModuleById(moduleId);
    if (!module) {
      throw new Error('模块不存在');
    }
    return this.formatData(format, [module], module);
  }

  exportEndpoint(moduleId, endpointId, format = 'json') {
    this.ensureFormat(format);
    const module = getModuleById(moduleId);
    if (!module) {
      throw new Error('模块不存在');
    }
    const endpoint = getEndpoint(moduleId, endpointId);
    if (!endpoint) {
      throw new Error('接口不存在');
    }
    return this.formatData(format, [{ ...module, endpoints: [endpoint] }], module, endpoint);
  }

  ensureFormat(format) {
    if (!SUPPORTED_FORMATS.includes(format)) {
      throw new Error(`不支持的导出格式: ${format}`);
    }
  }

  formatData(format, modules, currentModule, currentEndpoint) {
    switch (format) {
      case 'json':
        return { modules };
      case 'postman':
        return this.toPostman(modules);
      case 'markdown':
        return { markdown: this.toMarkdown(modules) };
      case 'openapi':
        return this.toOpenApi(modules);
      default:
        throw new Error('未知的导出格式');
    }
  }

  toPostman(modules) {
    return {
      info: {
        name: 'Content Management Service API',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: modules.map((module) => ({
        name: module.name,
        description: module.description,
        item: module.endpoints.map((endpoint) => ({
          name: endpoint.name,
          request: {
            method: endpoint.method,
            header: [],
            url: {
              raw: `{{baseUrl}}${endpoint.path}`,
              host: ['{{baseUrl}}'],
              path: endpoint.path.replace(/^\//, '').split('/'),
            },
            description: endpoint.description,
            body: endpoint.requestBody
              ? { mode: 'raw', raw: JSON.stringify(endpoint.requestBody, null, 2) }
              : undefined,
          },
        })),
      })),
    };
  }

  toMarkdown(modules) {
    let md = '# 内容管理服务 API 文档\n\n';
    modules.forEach((module) => {
      md += `## ${module.name} (${module.id})\n`;
      md += `${module.description || ''}\n\n`;
      module.endpoints.forEach((endpoint) => {
        md += `### ${endpoint.name} \`${endpoint.method} ${endpoint.path}\`\n`;
        md += `${endpoint.description || ''}\n\n`;
        if (endpoint.params && endpoint.params.length > 0) {
          md += '**路径/查询参数：**\n\n';
          endpoint.params.forEach((param) => {
            md += `- \`${param.name}\` (${param.in}) ${param.required ? '(必填)' : ''}：${param.description || ''}\n`;
          });
          md += '\n';
        }
        if (endpoint.requestBody) {
          md += '**请求体：**\n\n';
          md += '```json\n';
          md += `${JSON.stringify(endpoint.requestBody, null, 2)}\n`;
          md += '```\n\n';
        }
        if (endpoint.responseBody) {
          md += '**响应体：**\n\n';
          md += '```json\n';
          md += `${JSON.stringify(endpoint.responseBody, null, 2)}\n`;
          md += '```\n\n';
        }
      });
    });
    return md;
  }

  toOpenApi(modules) {
    const paths = {};
    modules.forEach((module) => {
      module.endpoints.forEach((endpoint) => {
        const path = endpoint.path;
        const method = endpoint.method.toLowerCase();
        paths[path] = paths[path] || {};
        paths[path][method] = {
          summary: endpoint.name,
          description: endpoint.description,
          tags: module.tags || [module.name],
          parameters: (endpoint.params || []).map((param) => ({
            name: param.name,
            in: param.in,
            required: param.required,
            schema: { type: param.type || 'string' },
            description: param.description,
          })),
          requestBody: endpoint.requestBody
            ? {
                content: {
                  'application/json': {
                    schema: endpoint.requestBody,
                  },
                },
              }
            : undefined,
          responses: {
            200: {
              description: '成功响应',
              content: {
                'application/json': {
                  schema: endpoint.responseBody || { type: 'object' },
                },
              },
            },
          },
        };
      });
    });

    return {
      openapi: '3.0.0',
      info: {
        title: 'Content Management Service API',
        version: '1.0.0',
        description: '内容管理服务 API 文档',
      },
      paths,
    };
  }
}

