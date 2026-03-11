import { Request, Response } from 'express';
import { ApplicationService } from '@/services/application.service';
import {
    createApplicationSchema,
    updateApplicationSchema,
    applicationQuerySchema
} from '@/validators/application.validator';
import logger from '@/utils/logger';

const applicationService = new ApplicationService();

export class ApplicationController {
    async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const validatedData = createApplicationSchema.parse(req.body);

            const result = await applicationService.create(userId, validatedData);

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

            logger.error('Error in application create', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create application'
                }
            });
        }
    }

    async findAll(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const filters = applicationQuerySchema.parse(req.query);

            const result = await applicationService.findAll(userId, filters);

            if (result.isFailure()) {
                const error = result.getError();

                res.status(500).json({
                    success: false,
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: error.message
                    }
                });

                return;
            }

            res.status(200).json({
                success: true,
                ...result.getValue()
            });
        } catch (error: any) {
            logger.error('Error in application findAll', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch applications'
                }
            });
        }
    }
}
