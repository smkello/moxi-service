/**
 * 统一成功响应工具
 * 确保 data.code 恒为 '0000'，并将真实数据挂载到 data[resultKey]
 */
export function sendSuccess(res, payload = null, options = {}) {
  const {
    statusCode = 200,
    message,
    meta = {},
    resultKey = 'result',
  } = options;

  const responseBody = {
    success: true,
    ...meta,
    data: {
      code: '0000',
      ...(message ? { message } : {}),
      [resultKey]: payload ?? null,
    },
  };

  return res.status(statusCode).json(responseBody);
}


