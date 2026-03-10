import { Company } from '@prisma/client';
import { AsyncResult, Result } from '@/utils/Result';
import { NotFoundError, ConflictError } from '@/utils/errors/AppError';
import prisma from '@/config/database';
import logger from '@/utils/logger';
import type { PaginatedResponse } from '@job-tracker/shared';

export interface CreateCompanyData {
    name: string;
    website?: string;
    industry?: string;
    location?: string;
    size?: string;
    description?: string;
    notes?: string;
    rating?: number;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {}

export interface CompanyFilters {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
}

export class CompanyService {
    /**
     * Create a new company
     */
    async create(
        userId: string,
        data: CreateCompanyData
    ): AsyncResult<Company, Error> {
        try {
            // check if company with same name already exists for this user
            const existingCompany = await prisma.company.findFirst({
                where: {
                    name: data.name,
                    userId
                }
            });

            if (existingCompany) {
                return Result.fail(
                    new ConflictError('Company with this name already exists')
                );
            }

            const company = await prisma.company.create({
                data: {
                    ...data,
                    userId
                }
            });

            logger.info('Company created', { companyId: company.id, userId });

            return Result.ok(company);
        } catch (error) {
            logger.error('Error creating company', { error, userId, data });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get all companies for a user with pagination
     */
    async findAll(
        userId: string,
        filters: CompanyFilters
    ): AsyncResult<PaginatedResponse<Company>, Error> {
        try {
            const { page, limit, sortBy, sortOrder, search } = filters;
            const skip = (page - 1) * limit;
            
            // build where clause
            const where: any = { userId };

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { industry: { contains: search, mode: 'insensitive' } },
                    { location: { contains: search, mode: 'insensitive' } }
                ];
            }

            // get companies and total count
            const [companies, total] = await Promise.all([
                prisma.company.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    include: {
                        _count: {
                            select: { applications: true }
                        }
                    }
                }),
                prisma.company.count({ where })
            ]);

            return Result.ok({
                data: companies,
                pagination: {
                    page,
                    limit,
                    total, 
                    totalPages: Math.ceil(total / limit),
                    hasNext: skip + limit < total,
                    hasPrev: page > 1
                }
            });
        } catch (error) {
            logger.error('Error fetching companies', { error, userId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get a single company by ID
     */
    async findById(
        userId: string,
        companyId: string
    ): AsyncResult<Company, Error> {
        try {
            const company = await prisma.company.findFirst({
                where: {
                    id: companyId,
                    userId
                },
                include: {
                    _count: {
                        select: { applications: true }
                    }
                }
            });

            if (!company) {
                return Result.fail(new NotFoundError('Company'));
            }

            return Result.ok(company);
        } catch (error) {
            logger.error('Error fetching company', { error, userId, companyId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Update a company
     */
    async update(
        userId: string,
        companyId: string,
        data: UpdateCompanyData
    ): AsyncResult<Company, Error> {
        try {
            // check if company exists and belongs to user
            const existingCompany = await prisma.company.findFirst({
                where: {
                    id: companyId,
                    userId
                }
            });

            if (!existingCompany) {
                return Result.fail(new NotFoundError('Company'));
            }

            // if updating name, check for conflicts
            if (data.name && data.name !== existingCompany.name) {
                const nameConflict = await prisma.company.findFirst({
                    where: {
                        name: data.name,
                        userId,
                        id: { not: companyId }
                    }
                });

                if (nameConflict) {
                    return Result.fail(
                        new ConflictError('Company with this name already exists')
                    );
                }
            }

            const company = await prisma.company.update({
                where: { id: companyId },
                data
            });

            logger.info('Company updated', { companyId, userId });

            return Result.ok(company);
        } catch (error) {
            logger.error('Error updating company', { error, userId, companyId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Delete a company
     */
    async delete(
        userId: string,
        companyId: string
    ): AsyncResult<void, Error> {
        try {
            // checks if company exists and belongs to user
            const company = await prisma.company.findFirst({
                where: {
                    id: companyId,
                    userId
                }
            });

            if (!company) {
                return Result.fail(new NotFoundError('Company'));
            }

            await prisma.company.delete({
                where: { id: companyId }
            });

            logger.info('Company deleted', { companyId, userId });

            return Result.ok(undefined);
        } catch (error) {
            logger.error('Error deleting company', { error, userId, companyId });

            return Result.fail(error as Error);
        }
    }
}
