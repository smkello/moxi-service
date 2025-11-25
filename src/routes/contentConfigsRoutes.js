import { Router } from 'express';
import { ContentConfigsController } from '../controllers/contentConfigsController.js';

const router = Router();
const controller = new ContentConfigsController();

router.get('/content-configs', (req, res) => controller.listContentConfigs(req, res));
router.post('/content-configs', (req, res) => controller.createContentConfig(req, res));
router.put('/content-configs/:id', (req, res) => controller.updateContentConfig(req, res));
router.delete('/content-configs/:id', (req, res) => controller.deleteContentConfig(req, res));
router.get('/content-configs/:id', (req, res) => controller.getContentConfig(req, res));
router.patch('/content-configs/:id/status', (req, res) => controller.toggleContentConfigStatus(req, res));

export default router;

