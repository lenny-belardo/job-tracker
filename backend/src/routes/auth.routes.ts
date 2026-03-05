import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { authRateLimiter, apiLimiter } from '@/middleware/rate-limit.middleware';

const router = Router();
const authController = new AuthController();

/**
 * Public routes (with rate limiting)
 */
router.post(
    '/register',
    authRateLimiter,
    (req, res) => authController.register(req, res)
);

router.post(
    '/login',
    authRateLimiter,
    (req, res) => authController.login(req, res)
);

router.post(
    '/refresh',
    apiLimiter,
    (req, res) => authController.refreshToken(req, res)
);

/**
 * Protected routes (require authentication)
 */
router.get(
    '/profile',
    authenticate,
    (req, res) => authController.getProfile(req, res) 
);

router.post(
    '/logout',
    authenticate,
    (req, res) => authController.logout(req, res) 
);

export default router;
