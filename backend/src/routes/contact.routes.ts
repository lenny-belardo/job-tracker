import { Router } from 'express';
import { ContactController } from '@/controllers/contact.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();
const contactController = new ContactController();

// all contact routes require authentication
router.use(authenticate);

router.post('/', (req, res) => contactController.create(req, res));
router.get('/application/:applicationId', (req, res) => contactController.findByApplication(req, res));
router.get('/:id', (req, res) => contactController.findById(req, res));
router.put('/:id', (req, res) => contactController.update(req, res));
router.delete('/:id', (req, res) => contactController.delete(req, res));

export default router;
