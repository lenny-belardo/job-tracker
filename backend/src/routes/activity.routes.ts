import { Router } from 'express';
import { ActivityController } from '@/controllers/activity.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();
const activityController = new ActivityController();

// all activity routes require authentication
router.use(authenticate);

router.post('/', (req, res) => activityController.create(req, res));
router.get('/recent', (req, res) => activityController.getRecentActivities(req, res));
router.get('/application/:applicationId', (req, res) => activityController.findByApplication(req, res));
router.get('/:id', (req, res) => activityController.findById(req, res));
router.put('/:id', (req, res) => activityController.update(req, res));
router.delete('/:id', (req, res) => activityController.delete(req, res));

export default router;
