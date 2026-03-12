import { Router } from 'express';
import { ApplicationController } from '@/controllers/application.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();
const applicationController = new ApplicationController();

// all application routes require authentication
router.use(authenticate);

router.post('/', (req, res) => applicationController.create(req, res));
router.get('/', (req, res) => applicationController.findAll(req, res));
router.get('/stats', (req, res) => applicationController.getStats(req, res));
router.get('/:id', (req, res) => applicationController.findById(req, res));
router.put('/:id', (req, res) => applicationController.update(req, res));
router.delete('/:id', (req, res) => applicationController.delete(req, res));

export default router;
