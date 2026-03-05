import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema
} from '@/validators/auth.validator';
import logger from '@/utils/logger';

const authService = new AuthService();

export class AuthController {
    /**
     * Register new user
     * POST /api/auth/register
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            const validatedData = registerSchema.parse(req.body);

            // Call service
            const result = await authService.register(validatedData);

            if (result.isFailure()) {
                const error = result.getError();
                const appError = error as any;

                res.status(appError.statusCode || 400).json({
                    success: false,
                    error: {
                        code: appError.code || 'REGISTRATION_FAILED',
                        message: error.message,
                        details: appError.details
                    }
                });

                return;
            }

            const authData = result.getValue();

            res.status(201).json({
                success: true,
                data: authData,
                meta: {
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error: any) {
            // Handle Zod validation errors
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: error.errors
                    }
                });

                return;
            }

            logger.error('Unexpected error in register', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred'
                }
            });
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = loginSchema.parse(req.body);

            const result = await authService.login(validatedData);

            if (result.isFailure()) {
                const error = result.getError();
                const appError = error as any;

                res.status(appError.statusCode || 401).json({
                    success: false,
                    error: {
                        code: appError.code || 'LOGIN_FAILED',
                        message: error.message
                    }
                });

                return;
            }

            const authData = result.getValue();

            res.status(200).json({
                success: true,
                data: authData
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: error.errors
                    }
                });

                return;
            }

            logger.error('Unexpected error in login', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred'
                }
            });
        }
    }

    /**
     * Get current user profile
     * GET /api/auth/profile
     */
    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;

            const result = await authService.getProfile(userId);

            if (result.isFailure()) {
                const error = result.getError();
                const appError = error as any;

                res.status(appError.statusCode || 404).json({
                    success: false,
                    error: {
                        code: appError.code || 'PROFILE_FETCH_FAILED',
                        message: error.message
                    }
                });

                return;
            }

            res.status(200).json({
                success: true,
                data: result.getValue()
            });
        } catch (error) {
            logger.error('Error fetching profile', { error, userId: req.user?.id });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch profile'
                }
            });
        }
    }

    /**
     * Refresh access token
     * POST /api/auth/refresh
     */
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = refreshTokenSchema.parse(req.body);

            const result = await authService.refreshToken(validatedData.refreshToken);

            if (result.isFailure()) {
                const error = result.getError();
                const appError = error as any;

                res.status(appError.statusCode || 401).json({
                    success: false,
                    error: {
                        code: appError.code || 'TOKEN_REFRESH_FAILED',
                        message: error.message
                    }
                });

                return;
            }

            res.status(200).json({
                sucsess: true,
                data: result.getValue()
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: error.errors
                    }
                });

                return;
            }

            logger.error('Error refreshing token', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to refresh token'
                }
            });
        }
    }

    /**
     * Logout user
     * POST /api/auth/logout
     */
    async logout(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const userId = req.user?.id;

            if (refreshToken && userId) {
                await authService.logout(userId, refreshToken);
            }

            res.status(200).json({
                success: true,
                data: {
                    message: 'Logged out successfully'
                }
            });
        } catch (error) {
            logger.error('Error during logout', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to logout'
                }
            });
        }
    }
}
