import { body, validationResult } from 'express-validator';

/**
 * 验证中间件
 */
export function validate(validations) {
  return async (req, res, next) => {
    // 执行所有验证规则
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      error: '请求验证失败',
      errors: errors.array(),
      success: false,
    });
  };
}

/**
 * 根据端点定义生成验证规则
 */
export function generateValidationRules(endpoint) {
  const rules = [];
  
  if (endpoint.requestBody && endpoint.requestBody.properties) {
    const properties = endpoint.requestBody.properties;
    const required = endpoint.requestBody.required || [];
    
    Object.keys(properties).forEach(key => {
      const prop = properties[key];
      const isRequired = required.includes(key);
      
      if (prop.type === 'string') {
        let rule = body(key);
        if (isRequired) {
          rule = rule.notEmpty().withMessage(`${key} 不能为空`);
        }
        rules.push(rule);
      } else if (prop.type === 'array') {
        let rule = body(key);
        if (isRequired) {
          rule = rule.isArray().withMessage(`${key} 必须是数组`);
        }
        rules.push(rule);
      } else if (prop.type === 'boolean') {
        let rule = body(key);
        if (isRequired) {
          rule = rule.isBoolean().withMessage(`${key} 必须是布尔值`);
        }
        rules.push(rule);
      }
    });
  }
  
  return rules;
}

