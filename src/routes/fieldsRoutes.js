import { Router } from 'express';
import { FieldsController } from '../controllers/fieldsController.js';

const router = Router();
const controller = new FieldsController();

router.get('/fields', (req, res) => controller.listFields(req, res));
router.post('/fields', (req, res) => controller.createField(req, res));
router.put('/fields/:id', (req, res) => controller.updateField(req, res));
router.delete('/fields/:id', (req, res) => controller.deleteField(req, res));
router.patch('/fields/:id/status', (req, res) => controller.toggleFieldStatus(req, res));

export default router;

