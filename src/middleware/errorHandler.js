/**
 * 错误处理中间件
 */
export function errorHandler(err, req, res, next) {
  console.error('错误:', err);

  // 如果是验证错误
  if (err.name === 'ValidationError') {
    return res.status(200).json({
      data: {
        code: err.code,
        message: err.message,
      },
      
      success: true,
    });
  }

  // 如果是数据库错误
  if (err.name === 'MongoError' || err.code) {
    return res.status(500).json({
      error: '数据库操作失败',
      success: false,
    });
  }

  // 默认错误
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    error: message,
    success: false,
  });
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: '接口不存在',
    path: req.path,
    method: req.method,
    success: false,
  });
}

