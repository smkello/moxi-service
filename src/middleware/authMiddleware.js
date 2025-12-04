/**
 * 认证中间件
 * 验证登录令牌并获取用户信息
 */
import config from '../config/index.js';

// Debug 日志函数
function debugLog(...args) {
  if (config.server.debug) {
    console.log('[Auth Middleware]', ...args);
  }
}

/**
 * 创建认证中间件
 * @param {Object} options - 配置选项
 * @param {string} options.authApiUrl - 登录校验接口地址
 * @param {boolean} options.required - 是否必须认证，默认true
 * @returns {Function} Express中间件
 */
export function createAuthMiddleware(options = {}) {
  const {
    authApiUrl = process.env.AUTH_API_URL || 'http://localhost:3000/openapi/memberships/login/verify',
    required = true,
  } = options;

  return async function authMiddleware(req, res, next) {
    // 如果不需要认证，直接通过
    if (!required) {
      return next();
    }

    // 从请求头获取Authorization token
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // 透传站点标识 X-Site
    const xSite = req.headers['x-site'] || req.headers['X-Site'];
    
    debugLog('验证请求:', req.method, req.path);
    
    if (!authHeader) {
      debugLog('缺少 Authorization 头');
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: '缺少Authorization头',
      });
    }

    // 提取Bearer token
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!tokenMatch) {
      debugLog('Authorization 格式错误');
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN_FORMAT',
        message: 'Authorization格式错误，应为: Bearer <token>',
      });
    }

    const token = tokenMatch[1];
    debugLog('提取 token:', token.substring(0, 20) + '...');

    try {
      // 调用登录校验接口
      debugLog('调用认证接口:', authApiUrl);
      const verifyResponse = await fetch(authApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-System-Code': config.system.code,
          ...(xSite ? { 'X-Site': xSite } : {}),
        },
      });

      const verifyResult = await verifyResponse.json();
      debugLog('认证接口响应:', verifyResult);

      // 检查校验结果
      if ( verifyResult.code !== '0000') {
        debugLog('认证失败:', verifyResult.code, verifyResult.message);
        return res.status(401).json({
          success: false,
          code: verifyResult.code || 'TOKEN_INVALID',
          message: verifyResult.message || '登录令牌无效或已过期',
        });
      }

      // 提取用户_id
      const userId = verifyResult.data?._id;
      if (!userId) {
        debugLog('认证成功但未返回用户ID');
        return res.status(401).json({
          success: false,
          code: 'USER_ID_MISSING',
          message: '登录校验成功但未返回用户ID',
        });
      }

      // 将用户信息存储到请求对象中
      req.user = {
        _id: userId,
        id: verifyResult.data?.id,
        phone: verifyResult.data?.phone,
      };

      debugLog('认证成功，用户ID:', userId);
      next();
    } catch (error) {
      console.error('认证中间件错误:', error);
      debugLog('认证服务调用异常:', error.message);
      return res.status(500).json({
        success: false,
        code: 'AUTH_SERVICE_ERROR',
        message: `认证服务调用失败: ${error.message}`,
      });
    }
  };
}

/**
 * 可选认证中间件（不强制要求认证）
 */
export function optionalAuthMiddleware(options = {}) {
  return createAuthMiddleware({ ...options, required: false });
}

