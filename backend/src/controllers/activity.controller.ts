import { Request, Response } from 'express';
import { ActivityService } from '@/services/activity.service';
import {
    createActivitySchema,
    updateActivitySchema,
    // updateActivitySchema
} from '@/validators/activity.validator';
import logger from '@/utils/logger';

const activityService = new ActivityService();

export class ActivityController {
    async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const validatedData = createActivitySchema.parse(req.body);

            const result = await activityService.create(userId, validatedData);

            if (result.isFailure()) {
                const error = result.getError();
                const appError = error as any;

                res.status(appError.statusCode || 400).json({
                    success: false,
                    error: {
                        code: appError.code,
                        message: error.message
                    }
                });

                return;
            }

            res.status(201).json({
                success: true,
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

            logger.error('Error in activity create', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create activity'
                }
            });
        }
    }

    async findByApplication(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { applicationId } = req.params;

            const result = await activityService.findByApplication(userId, applicationId);

            if (result.isFailure()) {
                const error = result.getError();
                const appError = error as any;

                res.status(appError.statusCode || 404).json({
                    success: false,
                    error: {
                        code: appError.code,
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
            logger.error('Error fetching activities', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch activities'
                }
            });
        }
    }

    async findById(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            const result = await activityService.findById(userId, id);

            if (result.isFailure()) {
                const error = result.getError();
                const appError = error as any;

                res.status(appError.statusCode || 404).json({
                    success: false,
                    error: {
                        code: appError.code,
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
            logger.error('Error fetching activity', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch activity'
                }
            });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const validatedData = updateActivitySchema.parse(req.body);

            const result = await activityService.update(userId, id, validatedData);

            if (result.isFailure()) {
                const error = result.getError();
                const appError = error as any;

                res.status(appError.statusCode || 400).json({
                    success: false,
                    error: {
                        code: appError.code,
                        message: error.message
                    }
                });

                return;
            }

            res.status(200).json({
                success: true,
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

            logger.error('Error in activity update', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to update activity'
                }
            });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            const result = await activityService.delete(userId, id);

            if (result.isFailure()) {
                const error = result.getError();
                const appError = error as any;

                res.status(appError.statusCode || 404).json({
                    success: false,
                    error: {
                        code: appError.code,
                        message: error.message
                    }
                });

                return;
            }

            res.status(200).json({
                success: true,
                data: {
                    message: 'Activity deleted successfully'
                }
            });
        } catch (error) {
            logger.error('Error in activity delete', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to delete activity'
                }
            });
        }
    }
}
