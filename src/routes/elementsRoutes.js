import { Router } from 'express';
import { ElementsController } from '../controllers/elementsController.js';

const router = Router();
const controller = new ElementsController();

router.get('/elements', (req, res) => controller.listElements(req, res));
router.post('/elements', (req, res) => controller.createElement(req, res));
router.put('/elements/:id', (req, res) => controller.updateElement(req, res));
router.delete('/elements/:id', (req, res) => controller.deleteElement(req, res));
router.patch('/elements/:id/options', (req, res) => controller.updateElementOptions(req, res));

export default router;

