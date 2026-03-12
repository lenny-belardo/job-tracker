import { Router } from 'express';
import { CompanyController } from '@/controllers/company.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();
const companyController = new CompanyController();

// all company routes require authentication
router.use(authenticate);

router.post('/', (req, res) => companyController.create(req, res));
router.get('/', (req, res) => companyController.findAll(req, res));
router.get('/:id', (req, res) => companyController.findById(req, res));
router.put('/:id', (req, res) => companyController.update(req, res));
router.delete('/:id', (req, res) => companyController.delete(req, res));

export default router;
