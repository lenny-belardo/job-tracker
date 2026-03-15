import { Request, Response } from 'express';
import { ActivityService } from '@/services/activity.service';
import {
    createActivitySchema,
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
}
