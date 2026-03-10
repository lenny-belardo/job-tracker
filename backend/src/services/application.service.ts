import { Application } from '@prisma/client';
import { AsyncResult, Result } from '@/utils/Result';
import { NotFoundError } from '@/utils/errors/AppError';
import prisma from '@/config/database';
import logger from '@/utils/logger';
import type { PaginatedResponse } from '@job-tracker/shared';

export interface CreateApplicationData {
    jobTitle: string;
    companyId: string;
    status?: string;
    priority?: string;
    jobType?: string;
    workLocation?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    jobUrl?: string;
    jobDescription?: string;
    requirements?: string;
    benefits?: string;
    applicationDate?: string;
    followUpDate?: string;
    interviewDate?: string;
    notes?: string;
    referralSource?: string;
}

export interface UpdateApplicationData extends Partial<Omit<CreateApplicationData, 'companyId'>> {}

export interface ApplicationFilters {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
    status?: string;
    priority?: string;
    companyId?: string;
}

export class ApplicationService {
    /**
     * Create a new application
     */
    async create(
        userId: string,
        data: CreateApplicationData
    ): AsyncResult<Application, Error> {
        try {
            // Verify company belongs to user
            const company = await prisma.company.findFirst({
                where: {
                    id: data.companyId,
                    userId
                }
            });

            if (!company) {
                return Result.fail(new NotFoundError('Company'));
            }

            const application = await prisma.application.create({
                data: {
                    jobTitle: data.jobTitle,
                    companyId: data.companyId,
                    userId,
                    ...(data.status && { status: data.status as any }),
                    ...(data.priority && { priority: data.priority as any }),
                    ...(data.jobType && { jobType: data.jobType as any }),
                    ...(data.workLocation && { workLocation: data.workLocation as any }),
                    ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
                    ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
                    ...(data.salaryCurrency && { salaryCurrency: data.salaryCurrency }),
                    ...(data.jobUrl && { jobUrl: data.jobUrl }),
                    ...(data.jobDescription && { jobDescription: data.jobDescription }),
                    ...(data.requirements && { requirements: data.requirements }),
                    ...(data.benefits && { benefits: data.benefits }),
                    ...(data.applicationDate && { applicationDate: new Date(data.applicationDate) }),
                    ...(data.followUpDate && { followUpDate: new Date(data.followUpDate) }),
                    ...(data.interviewDate && { interviewDate: new Date(data.interviewDate) }),
                    ...(data.notes && { notes: data.notes }),
                    ...(data.referralSource && { referralSource: data.referralSource })
                },
                include: {
                    company: true
                }
            });

            logger.info('Application created', { applicationId: application.id, userId});

            return Result.ok(application);
        } catch (error) {
            logger.error('Error creating application', { error, userId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get all applications with pagination
     */
    async findAll(
        userId: string,
        filters: ApplicationFilters
    ): AsyncResult<PaginatedResponse<Application>, Error> {
        try {
            const { page, limit, sortBy, sortOrder, search, status, priority, companyId } = filters;

            const skip = page * limit;

            const where: any = { userId };

            if (search) {
                where.OR = [
                    { jobTitle: { contains: search, mode: 'insensitive' } },
                    { company: { name: { contains: search, mode: 'insensitive' } } }
                ];
            }

            if (status) {
                where.status = status;
            }

            if (priority) {
                where.priority = priority;
            }

            if (companyId) {
                where.companyId = companyId;
            }

            const [applications, total] = await Promise.all([
                prisma.application.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    include: {
                        company: true
                    }
                }),
                prisma.application.count({ where })
            ]);

            return Result.ok({
                data: applications,
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
            logger.error('Error fetching applications', { error, userId });

            return Result.fail(error as Error);
        }
    }
}
