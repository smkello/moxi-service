import { loadApiDoc } from './apiDocLoader.js';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getMethodColor(method) {
  const colors = {
    GET: '#27ae60',
    POST: '#f39c12',
    PUT: '#2980b9',
    DELETE: '#e74c3c',
    PATCH: '#8e44ad',
  };
  return colors[method.toUpperCase()] || '#6c63ff';
}

const baseStyles = `
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      color: #1f2d3d;
    }
    .hero {
      background: linear-gradient(135deg, #6c63ff 0%, #8b7bff 100%);
      color: #fff;
      padding: 40px 32px;
      text-align: center;
      border-radius: 0 0 20px 20px;
    }
    .hero h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }
    .hero p {
      margin-top: 8px;
      opacity: 0.9;
      font-size: 14px;
    }
    .container {
      max-width: 1400px;
      margin: -40px auto 40px;
      padding: 0 24px;
      position: relative;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }
    .summary-card {
      background: #fff;
      border-radius: 16px;
      padding: 32px 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      text-align: center;
    }
    .summary-number {
      font-size: 48px;
      font-weight: 700;
      color: #6c63ff;
      margin-bottom: 8px;
    }
    .summary-label {
      color: #8c9aae;
      font-size: 14px;
    }
    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    .module-card-wrapper {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }
    .module-card-wrapper:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    }
    .module-card-link {
      flex: 1;
      cursor: pointer;
    }
    .module-card {
      display: block;
    }
    .module-header {
      background: linear-gradient(135deg, #6c63ff 0%, #8b7bff 100%);
      color: #fff;
      padding: 20px;
    }
    .module-name {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .module-id {
      font-size: 12px;
      opacity: 0.8;
      text-transform: lowercase;
    }
    .module-body {
      padding: 20px;
    }
    .module-count {
      display: inline-block;
      background: #e8f0fe;
      color: #6c63ff;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      margin-bottom: 16px;
    }
    .endpoint-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .endpoint-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f2f7;
    }
    .endpoint-item:last-child {
      border-bottom: none;
    }
    .method-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      margin-right: 12px;
      min-width: 50px;
      text-align: center;
    }
    .endpoint-name {
      flex: 1;
      font-size: 14px;
      color: #1f2d3d;
    }
    .module-footer {
      padding: 16px 20px;
      border-top: 1px solid #f0f2f7;
      text-align: center;
      position: relative;
    }
    .export-dropdown {
      position: relative;
      display: inline-block;
    }
    .btn-export {
      background: #6c63ff;
      color: #fff;
      border: none;
      padding: 10px 32px 10px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
      position: relative;
    }
    .btn-export::after {
      content: '▼';
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 10px;
    }
    .btn-export:hover {
      background: #5a52e5;
    }
    .export-menu {
      display: none;
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 150px;
      z-index: 100;
      overflow: hidden;
    }
    .export-menu.show {
      display: block;
    }
    .export-menu-item {
      display: block;
      padding: 10px 16px;
      color: #1f2d3d;
      text-decoration: none;
      font-size: 14px;
      transition: background 0.2s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }
    .export-menu-item:hover {
      background: #f0f2f7;
    }
    .export-menu-item:first-child {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    .export-menu-item:last-child {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    .back-link {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #6c63ff;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 10px 18px;
      background: #ffffff;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #e8ecf0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(10px);
    }
    .back-link:hover {
      background: #6c63ff;
      color: #fff;
      text-decoration: none;
      transform: translateX(-4px) translateY(-1px);
      box-shadow: 0 4px 16px rgba(108, 99, 255, 0.25);
      border-color: #6c63ff;
    }
    .back-link::before {
      content: '←';
      font-size: 16px;
      font-weight: 600;
      transition: transform 0.3s;
    }
    .back-link:hover::before {
      transform: translateX(-2px);
    }
    .module-detail-header {
      background: linear-gradient(135deg, #6c63ff 0%, #8b7bff 100%);
      color: #fff;
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 24px;
      margin-top: 20px;
    }
    .module-detail-title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .module-detail-subtitle {
      opacity: 0.9;
      font-size: 14px;
    }
    .endpoint-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .endpoint-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f2f7;
    }
    .toggle-icon {
      color: #6c63ff;
      font-size: 12px;
      transition: transform 0.3s ease;
      user-select: none;
    }
    .toggle-icon.expanded {
      transform: rotate(180deg);
    }
    .endpoint-details {
      margin-top: 16px;
      animation: slideDown 0.3s ease;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .endpoint-path {
      font-family: 'Fira Code', monospace;
      color: #6c63ff;
      font-size: 14px;
    }
    .endpoint-title {
      font-size: 18px;
      font-weight: 600;
      margin-top: 8px;
    }
    .endpoint-desc {
      color: #8c9aae;
      font-size: 14px;
      margin-top: 4px;
    }
    .section {
      margin-top: 20px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1f2d3d;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      background: #fff;
    }
    table th, table td {
      border: 1px solid #eef0f6;
      padding: 12px;
      text-align: left;
    }
    table th {
      background: #f9fafe;
      font-weight: 600;
      color: #1f2d3d;
    }
    table td {
      color: #5a6c7d;
    }
    pre {
      background: #f6f8fb;
      padding: 16px;
      border-radius: 8px;
      font-size: 13px;
      overflow: auto;
      border: 1px solid #eef0f6;
    }
    .export-links {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .export-links a {
      padding: 6px 12px;
      background: #f0f2f7;
      color: #6c63ff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 12px;
      transition: all 0.2s;
    }
    .export-links a:hover {
      background: #6c63ff;
      color: #fff;
    }
    .empty {
      color: #b0bacb;
      font-style: italic;
    }
    @media (max-width: 768px) {
      .summary {
        grid-template-columns: 1fr;
      }
      .modules-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
`;

function renderParams(params = []) {
  if (!params || params.length === 0) return '<p class="empty">无参数</p>';
  
  // 按参数位置分组（path, query, body等）
  const pathParams = params.filter(p => p.in === 'path');
  const queryParams = params.filter(p => p.in === 'query');
  const otherParams = params.filter(p => !p.in || (p.in !== 'path' && p.in !== 'query'));
  
  let html = '';
  
  if (pathParams.length > 0) {
    html += '<div class="section-title" style="margin-top: 0;">路径参数</div>';
    html += renderParamsTable(pathParams);
  }
  
  if (queryParams.length > 0) {
    html += '<div class="section-title" style="margin-top: 16px;">查询参数</div>';
    html += renderParamsTable(queryParams);
  }
  
  if (otherParams.length > 0) {
    html += '<div class="section-title" style="margin-top: 16px;">其他参数</div>';
    html += renderParamsTable(otherParams);
  }
  
  return html;
}

function renderParamsTable(params) {
  const rows = params.map((p) => {
    const example = p.example !== undefined ? String(p.example) : '-';
    return `
    <tr>
      <td><code>${escapeHtml(p.name)}</code></td>
      <td>${p.required ? '<span style="color:#e74c3c">是</span>' : '否'}</td>
      <td><code>${escapeHtml(p.type || 'string')}</code></td>
      <td>${escapeHtml(example)}</td>
      <td>${escapeHtml(p.description || '-')}</td>
    </tr>
  `;
  }).join('');
  
  return `<table>
    <thead>
      <tr>
        <th>参数名</th>
        <th>必填</th>
        <th>类型</th>
        <th>示例</th>
        <th>说明</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderBody(title, body) {
  if (!body) return '';
  let content = '';
  if (typeof body === 'object') {
    content = JSON.stringify(body, null, 2);
  } else {
    content = String(body);
  }
  return `
    <div class="section">
      <div class="section-title">${title}</div>
      <pre>${escapeHtml(content)}</pre>
    </div>
  `;
}

function renderEndpointDetail(moduleId, endpoint) {
  const methodColor = getMethodColor(endpoint.method);
  const params = endpoint.params || [];
  // 生成安全的ID，移除所有特殊字符
  const safeModuleId = String(moduleId).replace(/[^a-zA-Z0-9]/g, '_');
  const safeEndpointId = String(endpoint.id).replace(/[^a-zA-Z0-9]/g, '_');
  const endpointId = `endpoint_${safeModuleId}_${safeEndpointId}`;
  
  // 解析请求体和响应体
  let requestBody = null;
  let responseBody = null;
  
  if (endpoint.requestBody) {
    if (endpoint.requestBody.example) {
      requestBody = endpoint.requestBody.example;
    } else if (endpoint.requestBody.properties) {
      requestBody = endpoint.requestBody;
    }
  }
  
  if (endpoint.responseBody) {
    if (endpoint.responseBody.example) {
      responseBody = endpoint.responseBody.example;
    } else if (endpoint.responseBody.items?.example) {
      responseBody = endpoint.responseBody.items.example;
    } else if (endpoint.responseBody.properties) {
      responseBody = endpoint.responseBody;
    }
  }

  const hasDetails = params.length > 0 || requestBody || responseBody;

  return `
    <div class="endpoint-card">
      <div class="endpoint-card-header toggle-header" data-endpoint-id="${endpointId}" style="cursor: pointer;">
        <div style="flex: 1;">
          <span class="method-badge" style="background: ${methodColor}">${endpoint.method}</span>
          <span class="endpoint-path">${escapeHtml(endpoint.path)}</span>
        </div>
        ${hasDetails ? `<span class="toggle-icon" id="toggle_${endpointId}">▼</span>` : ''}
      </div>
      <div class="endpoint-title">${escapeHtml(endpoint.name)}</div>
      <div class="endpoint-desc">${escapeHtml(endpoint.description || '')}</div>
      
      <div class="endpoint-details" id="${endpointId}" style="display: none;">
        ${params.length > 0 ? `
          <div class="section">
            <div class="section-title">请求参数</div>
            ${renderParams(params)}
          </div>
        ` : ''}
        
        ${requestBody ? renderBody('请求体示例', requestBody) : ''}
        ${responseBody ? renderBody('响应体示例', responseBody) : ''}
        
        <div class="export-links">
          <a href="/api/docs/endpoint/${moduleId}/${endpoint.id}/export?format=json" target="_blank">导出 JSON</a>
          <a href="/api/docs/endpoint/${moduleId}/${endpoint.id}/export?format=markdown" target="_blank">导出 Markdown</a>
          <a href="/api/docs/endpoint/${moduleId}/${endpoint.id}/export?format=openapi" target="_blank">导出 OpenAPI</a>
          <a href="/api/docs/endpoint/${moduleId}/${endpoint.id}/export?format=postman" target="_blank">导出 Postman</a>
        </div>
      </div>
    </div>
  `;
}

export function renderHomePage() {
  const doc = loadApiDoc();
  const modules = doc.modules || [];
  const endpointCount = modules.reduce((sum, m) => sum + (m.endpoints?.length || 0), 0);
  let version = doc.version || '1.0.0';
  
  // 如果没有version字段，使用generatedAt的日期作为版本标识
  if (!doc.version && doc.generatedAt) {
    const date = new Date(doc.generatedAt);
    version = `1.0.0 (${date.toLocaleDateString('zh-CN')})`;
  }

  const summaryCards = `
    <div class="summary">
      <div class="summary-card">
        <div class="summary-number">${modules.length}</div>
        <div class="summary-label">功能模块</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${endpointCount}</div>
        <div class="summary-label">API接口</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${version}</div>
        <div class="summary-label">版本号</div>
      </div>
    </div>
  `;

  const modulesHtml = modules.map((module) => {
    const endpoints = module.endpoints || [];
    const endpointsList = endpoints.slice(0, 5).map((endpoint) => {
      const methodColor = getMethodColor(endpoint.method);
      return `
        <li class="endpoint-item">
          <span class="method-badge" style="background: ${methodColor}">${endpoint.method}</span>
          <span class="endpoint-name">${escapeHtml(endpoint.name)}</span>
        </li>
      `;
    }).join('');
    
    const moreCount = endpoints.length > 5 ? endpoints.length - 5 : 0;
    
    const moduleId = encodeURIComponent(module.id);
    const safeModuleId = String(module.id).replace(/[^a-zA-Z0-9]/g, '_');
    const dropdownId = `dropdown_${safeModuleId}`;
    return `
      <div class="module-card-wrapper">
        <a href="/docs/module/${moduleId}" class="module-card-link" style="text-decoration: none; color: inherit; display: block;">
          <div class="module-card">
            <div class="module-header">
              <div>
                <div class="module-name">${escapeHtml(module.name)}</div>
                <div class="module-id">${escapeHtml(module.id)}</div>
              </div>
            </div>
            <div class="module-body">
              <span class="module-count">${endpoints.length}个接口</span>
              <ul class="endpoint-list">
                ${endpointsList}
                ${moreCount > 0 ? `<li class="endpoint-item"><span style="color:#8c9aae;font-size:12px;">还有 ${moreCount} 个接口...</span></li>` : ''}
              </ul>
            </div>
          </div>
        </a>
        <div class="module-footer">
          <div class="export-dropdown">
            <button class="btn-export" data-dropdown-id="${dropdownId}">导出文档</button>
            <div class="export-menu" id="${dropdownId}">
              <a href="/api/docs/module/${moduleId}/export?format=json" target="_blank" class="export-menu-item">导出 JSON</a>
              <a href="/api/docs/module/${moduleId}/export?format=markdown" target="_blank" class="export-menu-item">导出 Markdown</a>
              <a href="/api/docs/module/${moduleId}/export?format=openapi" target="_blank" class="export-menu-item">导出 OpenAPI</a>
              <a href="/api/docs/module/${moduleId}/export?format=postman" target="_blank" class="export-menu-item">导出 Postman</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <meta charset="UTF-8" />
      <title>内容管理系统 API 文档</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      ${baseStyles}
    </head>
    <body>
      <div class="hero">
        <h1>内容管理系统</h1>
        <p>完整的API接口文档 - Express.js + Node.js</p>
      </div>
      <div class="container">
        ${summaryCards}
        <div class="modules-grid">
          ${modulesHtml}
        </div>
      </div>
      <script>
        function initExportDropdowns() {
          // 处理导出按钮点击
          document.querySelectorAll('.btn-export').forEach(btn => {
            btn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              const dropdownId = this.getAttribute('data-dropdown-id');
              if (dropdownId) {
                toggleExportMenu(dropdownId);
              }
            });
          });
          
          // 处理导出菜单项点击
          document.querySelectorAll('.export-menu-item').forEach(item => {
            item.addEventListener('click', function(e) {
              e.stopPropagation();
              // 点击后关闭菜单
              document.querySelectorAll('.export-menu').forEach(menu => {
                menu.classList.remove('show');
              });
            });
          });
          
          // 点击外部关闭下拉菜单
          document.addEventListener('click', function(e) {
            if (!e.target.closest('.export-dropdown')) {
              document.querySelectorAll('.export-menu').forEach(menu => {
                menu.classList.remove('show');
              });
            }
          });
        }
        
        function toggleExportMenu(dropdownId) {
          const menu = document.getElementById(dropdownId);
          if (menu) {
            // 关闭其他所有下拉菜单
            document.querySelectorAll('.export-menu').forEach(m => {
              if (m.id !== dropdownId) {
                m.classList.remove('show');
              }
            });
            // 切换当前菜单
            menu.classList.toggle('show');
          }
        }
        
        // 初始化
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initExportDropdowns);
        } else {
          initExportDropdowns();
        }
      </script>
    </body>
  </html>
  `;
}

export function renderModulePage(moduleId) {
  const doc = loadApiDoc();
  const modules = doc.modules || [];
  // 解码模块ID（如果被编码了）
  const decodedModuleId = decodeURIComponent(moduleId);
  const module = modules.find(m => m.id === decodedModuleId);
  
  if (!module) {
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
        <head>
          <meta charset="UTF-8" />
          <title>模块不存在</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <a href="/docs" class="back-link">← 返回首页</a>
            <h1>模块不存在</h1>
          </div>
        </body>
      </html>
    `;
  }

  const endpoints = module.endpoints || [];
  const endpointsHtml = endpoints.map((endpoint) => 
    renderEndpointDetail(module.id, endpoint)
  ).join('');

  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <meta charset="UTF-8" />
      <title>${escapeHtml(module.name)} - API 文档</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <a href="/docs" class="back-link">返回列表</a>
        <div class="module-detail-header">
          <div class="module-detail-title">${escapeHtml(module.name)}</div>
          <div class="module-detail-subtitle">模块标识: ${escapeHtml(module.id)} | 接口数量: ${endpoints.length}</div>
        </div>
        <div class="export-links" style="margin-bottom: 24px;">
          <a href="/api/docs/module/${module.id}/export?format=json" target="_blank">导出 JSON</a>
          <a href="/api/docs/module/${module.id}/export?format=markdown" target="_blank">导出 Markdown</a>
          <a href="/api/docs/module/${module.id}/export?format=openapi" target="_blank">导出 OpenAPI</a>
          <a href="/api/docs/module/${module.id}/export?format=postman" target="_blank">导出 Postman</a>
        </div>
        ${endpointsHtml}
      </div>
      <script>
        function toggleEndpoint(endpointId) {
          const details = document.getElementById(endpointId);
          const toggleIcon = document.getElementById('toggle_' + endpointId);
          
          if (details) {
            const isExpanded = details.style.display !== 'none';
            
            if (isExpanded) {
              details.style.display = 'none';
              if (toggleIcon) {
                toggleIcon.classList.remove('expanded');
              }
            } else {
              details.style.display = 'block';
              if (toggleIcon) {
                toggleIcon.classList.add('expanded');
              }
            }
          }
        }
        
        // 使用事件委托处理所有折叠/展开
        function initToggleHandlers() {
          const container = document.querySelector('.container');
          if (container) {
            container.addEventListener('click', function(e) {
              const header = e.target.closest('.toggle-header');
              if (header) {
                e.preventDefault();
                e.stopPropagation();
                const endpointId = header.getAttribute('data-endpoint-id');
                if (endpointId) {
                  toggleEndpoint(endpointId);
                }
              }
            });
          }
        }
        
        // 如果DOM已加载，立即初始化；否则等待DOMContentLoaded
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initToggleHandlers);
        } else {
          initToggleHandlers();
        }
      </script>
    </body>
  </html>
  `;
}
