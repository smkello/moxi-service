import { Router } from 'express';
import { DatasourcesController } from '../controllers/datasourcesController.js';

const router = Router();
const controller = new DatasourcesController();

router.get('/datasources', (req, res) => controller.listDatasources(req, res));
router.post('/datasources', (req, res) => controller.createDatasource(req, res));
router.get('/datasources/code/:code', (req, res) => controller.getDatasourceByCode(req, res));
router.put('/datasources/:id', (req, res) => controller.updateDatasource(req, res));
router.delete('/datasources/:id', (req, res) => controller.deleteDatasource(req, res));
router.get('/datasources/:id', (req, res) => controller.getDatasource(req, res));
router.post('/datasources/test', (req, res) => controller.testDatasource(req, res));
router.post('/datasources/:id/data', (req, res) => controller.fetchDatasourceData(req, res));

export default router;

