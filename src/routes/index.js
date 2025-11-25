import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import projectsRoutes from './projectsRoutes.js';
import contentConfigsRoutes from './contentConfigsRoutes.js';
import fieldsRoutes from './fieldsRoutes.js';
import elementsRoutes from './elementsRoutes.js';
import behaviorsRoutes from './behaviorsRoutes.js';
import datasourcesRoutes from './datasourcesRoutes.js';
import designProjectsRoutes from './designProjectsRoutes.js';
import apiDocsRoutes from './apiDocsRoutes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiDocPath = join(__dirname, '../docs/cms-api-docs.json');
const apiDefinition = JSON.parse(readFileSync(apiDocPath, 'utf-8'));

const router = Router();

// 健康检查接口（需通过应用入口的认证）
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API文档接口（需通过应用入口的认证）
router.get('/api-docs', (req, res) => {
  res.json(apiDefinition);
});

router.use(projectsRoutes);
router.use(contentConfigsRoutes);
router.use(fieldsRoutes);
router.use(elementsRoutes);
router.use(behaviorsRoutes);
router.use(datasourcesRoutes);
router.use(designProjectsRoutes);
router.use(apiDocsRoutes);

export default router;

