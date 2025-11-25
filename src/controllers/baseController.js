/**
 * 基础控制器类
 * 提供通用的控制器功能，支持用户数据隔离
 */
export class BaseController {
  constructor(service) {
    this.service = service;
  }

  /**
   * 从请求中获取用户ID并设置到服务中
   * @param {object} req - Express请求对象
   */
  setUserFromRequest(req) {
    if (req.user && req.user._id && this.service && typeof this.service.setUserId === 'function') {
      this.service.setUserId(req.user._id);
    }
  }
}
