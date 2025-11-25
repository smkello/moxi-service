export const sdkModules = [
  {
    id: 'heartbeatSdk',
    name: '心跳 SDK',
    description: '对外提供心跳激活与安全防护能力的 SDK 接口',
    tags: ['sdk', 'security', 'heartbeat'],
    endpoints: [
      {
        id: 'activateHeartbeat',
        name: '激活 / 更新心跳',
        method: 'POST',
        path: '/api/activate',
        description: '验证 heart token 并根据配置更新心跳状态，失败时会返回具体原因。',
        params: [
          {
            name: 'heart',
            in: 'header',
            required: true,
            type: 'string',
            description: '心跳 token，由前端 SDK 使用加密密钥生成。',
            example: 'HEART_TOKEN_FROM_CLIENT',
          },
        ],
        responseBody: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: '是否激活成功' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', description: '结果描述' },
                timestamp: { type: 'number', description: '服务器时间戳 (ms)' },
              },
            },
            message: { type: 'string', description: '错误描述，失败时返回' },
          },
          example: {
            success: true,
            data: {
              message: '心跳激活成功',
              timestamp: 1700000000000,
            },
          },
        },
        errorResponses: [
          {
            code: 400,
            description: '缺少 heart header 或 heart token 无效',
          },
          {
            code: 403,
            description: '心跳触发异常阈值被阻断',
          },
        ],
      },
    ],
  },
  {
    id: 'openApi',
    name: 'Open API',
    description: '对外提供的公开 API 接口，无需认证即可访问，主要用于获取项目配置和 JSON 数据',
    tags: ['openapi', 'public', 'project'],
    endpoints: [
      {
        id: 'getProjectJson',
        name: '获取项目 JSON',
        method: 'GET',
        path: '/open-api/projects/:code/json',
        description: '根据项目编码获取项目的 JSON 数据。该接口为公开接口，无需认证。',
        params: [
          {
            name: 'code',
            in: 'path',
            required: true,
            type: 'string',
            description: '项目编码',
            example: 'my-project',
          },
        ],
        responseBody: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: '是否成功' },
            code: { type: 'string', description: '项目编码' },
            data: { type: 'object', description: '项目 JSON 数据' },
          },
          example: {
            success: true,
            code: 'my-project',
            data: {
              // 项目 JSON 数据
            },
          },
        },
        errorResponses: [
          {
            code: 404,
            description: '项目不存在',
          },
          {
            code: 500,
            description: '服务器内部错误',
          },
        ],
      },
      {
        id: 'getProjectConfigs',
        name: '获取项目全部语言配置',
        method: 'GET',
        path: '/open-api/projects/:code/configs',
        description: '根据项目编码获取项目的所有语言配置。该接口为公开接口，无需认证。',
        params: [
          {
            name: 'code',
            in: 'path',
            required: true,
            type: 'string',
            description: '项目编码',
            example: 'my-project',
          },
        ],
        responseBody: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: '是否成功' },
            code: { type: 'string', description: '项目编码' },
            language: { type: 'null', description: '未指定语言时为 null' },
            data: { type: 'object', description: '所有语言的配置数据' },
          },
          example: {
            success: true,
            code: 'my-project',
            language: null,
            data: {
              'zh-CN': { /* 中文配置 */ },
              'en-US': { /* 英文配置 */ },
            },
          },
        },
        errorResponses: [
          {
            code: 404,
            description: '项目不存在',
          },
          {
            code: 500,
            description: '服务器内部错误',
          },
        ],
      },
      {
        id: 'getProjectConfigByLanguage',
        name: '获取项目指定语言配置',
        method: 'GET',
        path: '/open-api/projects/:code/configs/:language',
        description: '根据项目编码和语言编码获取指定语言的配置。该接口为公开接口，无需认证。',
        params: [
          {
            name: 'code',
            in: 'path',
            required: true,
            type: 'string',
            description: '项目编码',
            example: 'my-project',
          },
          {
            name: 'language',
            in: 'path',
            required: true,
            type: 'string',
            description: '语言编码，如 zh-CN、en-US 等',
            example: 'zh-CN',
          },
        ],
        responseBody: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: '是否成功' },
            code: { type: 'string', description: '项目编码' },
            language: { type: 'string', description: '语言编码' },
            data: { type: 'object', description: '指定语言的配置数据' },
          },
          example: {
            success: true,
            code: 'my-project',
            language: 'zh-CN',
            data: {
              // 中文配置数据
            },
          },
        },
        errorResponses: [
          {
            code: 404,
            description: '项目不存在或未找到指定语言的配置',
          },
          {
            code: 500,
            description: '服务器内部错误',
          },
        ],
      },
    ],
  },
];


