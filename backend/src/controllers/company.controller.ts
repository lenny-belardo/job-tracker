import { Request, Response } from 'express';
import { CompanyService } from '@/services/company.service';
import {
    createCompanySchema,
    updateCompanySchema,
    companyQuerySchema
} from '@/validators/company.validator';
import logger from '@/utils/logger';

const companyService = new CompanyService();

export class CompanyController {
    async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const validatedData = createCompanySchema.parse(req.body);

            const result = await companyService.create(userId, validatedData);

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

            logger.error('Error in company create', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create company'
                }
            });
        }
    }

    async findAll(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const filters = companyQuerySchema.parse(req.query);

            const result = await companyService.findAll(userId, filters);

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
            logger.error('Error in company findAll', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch companies'
                }
            });
        }
    }

    async findById(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            const result = await companyService.findById(userId, id);

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
            logger.error('Error in company findById', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch company'
                }
            });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const validatedData = updateCompanySchema.parse(req.body);

            const result = await companyService.update(userId, id, validatedData);

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

            logger.error('Error in company update', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to update company'
                }
            });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            const result = await companyService.delete(userId, id);

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
                    message: 'Company deleted successfully'
                }
            });
        } catch (error) {
            logger.error('Error in company delete', { error });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to delete company'
                }
            });
        }
    }
}
