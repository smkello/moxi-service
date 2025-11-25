import { Router } from 'express';
import { BehaviorsController } from '../controllers/behaviorsController.js';

const router = Router();
const controller = new BehaviorsController();

router.get('/behaviors', (req, res) => controller.listBehaviors(req, res));
router.post('/behaviors', (req, res) => controller.createBehavior(req, res));
router.get('/behaviors/code/:code', (req, res) => controller.getBehaviorByCode(req, res));
router.put('/behaviors/:id', (req, res) => controller.updateBehavior(req, res));
router.delete('/behaviors/:id', (req, res) => controller.deleteBehavior(req, res));
router.get('/behaviors/:id', (req, res) => controller.getBehavior(req, res));

export default router;

