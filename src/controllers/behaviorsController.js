import { BehaviorsService } from '../services/behaviorsService.js';

export class BehaviorsController {
  constructor() {
    this.service = new BehaviorsService();
  }

  async listBehaviors(req, res) {
    try {
      const behaviors = await this.service.listBehaviors({ projectId: req.query.projectId });
      return res.json(behaviors);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async createBehavior(req, res) {
    try {
      const behavior = await this.service.createBehavior(req.body);
      return res.status(201).json(behavior);
    } catch (error) {
      const statusCode = error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async updateBehavior(req, res) {
    try {
      const { id } = req.params;
      await this.service.updateBehavior(id, req.body);
      const behavior = await this.service.findById(id);
      return res.json(behavior);
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 :
                        error.message.includes('已存在') ? 409 : 400;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async deleteBehavior(req, res) {
    try {
      const { id } = req.params;
      await this.service.deleteBehavior(id);
      return res.json({ success: true });
    } catch (error) {
      const statusCode = error.message.includes('不存在') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message, success: false });
    }
  }

  async getBehavior(req, res) {
    try {
      const { id } = req.params;
      const behavior = await this.service.findById(id);
      if (!behavior) {
        return res.status(404).json({ error: '行为不存在', success: false });
      }
      return res.json(behavior);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }

  async getBehaviorByCode(req, res) {
    try {
      const { code } = req.params;
      const behavior = await this.service.getBehaviorByCode(code);
      if (!behavior) {
        return res.status(404).json({ error: '行为不存在', success: false });
      }
      return res.json(behavior);
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }
}

