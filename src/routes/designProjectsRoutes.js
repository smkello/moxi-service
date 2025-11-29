import { Router } from 'express';
import multer from 'multer';
import { DesignProjectsController } from '../controllers/designProjectsController.js';

const router = Router();
const controller = new DesignProjectsController();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname?.toLowerCase().endsWith('.zip')) {
      return cb(new Error('仅支持zip文件'));
    }
    return cb(null, true);
  },
});

router.get('/design-projects', (req, res) => controller.listDesignProjects(req, res));
router.post('/design-projects', (req, res) => controller.createDesignProject(req, res));
router.put('/design-projects/:id', (req, res) => controller.updateDesignProject(req, res));
router.delete('/design-projects/:id', (req, res) => controller.deleteDesignProject(req, res));
router.get('/design-projects/:id', (req, res) => controller.getDesignProject(req, res));
router.post('/design-projects/upload', (req, res, next) => {
  upload.single('zipFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        code: 'FILE_UPLOAD_ERROR',
        message: err.message,
      });
    }
    return controller.uploadDesignProjectPackage(req, res);
  });
});
router.post('/component-libraries/upload', (req, res, next) => {
  upload.single('zipFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        code: 'FILE_UPLOAD_ERROR',
        message: err.message,
      });
    }
    return controller.uploadGlobalComponentLibrary(req, res);
  });
});

export default router;

