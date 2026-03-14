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

            const skip = (page - 1) * limit;

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

    async findById(
        userId: string,
        applicationId: string
    ): AsyncResult<Application, Error> {
        try {
            const application = await prisma.application.findFirst({
                where: {
                    id: applicationId,
                    userId
                },
                include: {
                    company: true
                }
            });

            if (!application) {
                return Result.fail(new NotFoundError('Application'));
            }

            return Result.ok(application);
        } catch (error) {
            logger.error('Error fetching application', { error, userId, applicationId });

            return Result.fail(error as Error);
        }
    }

    async update(
        userId: string,
        applicationId: string,
        data: UpdateApplicationData
    ): AsyncResult<Application, Error> {
        try {
            const existingApplication = await prisma.application.findFirst({
                where: {
                    id: applicationId,
                    userId
                }
            });

            if (!existingApplication) {
                return Result.fail(new NotFoundError('Application'));
            }

            const updateData: any = {
                ...(data.jobTitle && { jobTitle: data.jobTitle }),
                ...(data.status && { status: data.status }),
                ...(data.priority && { priority: data.priority }),
                ...(data.jobType && { jobType: data.jobType }),
                ...(data.workLocation && { workLocation: data.workLocation }),
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
            };

            const application = await prisma.application.update({
                where: { id: applicationId },
                data: updateData,
                include: {
                    company: true
                }
            });

            logger.info('Application updated', { applicationId, userId });

            return Result.ok(application);
        } catch (error) {
            logger.error('Error updating application', { error, userId, applicationId });

            return Result.fail(error as Error);
        }
    }

    async delete(
        userId: string,
        applicationId: string
    ): AsyncResult<void, Error> {
        try {
            const application = await prisma.application.findFirst({
                where: {
                    id: applicationId,
                    userId
                }
            });

            if (!application) {
                return Result.fail(new NotFoundError('Application'));
            }

            await prisma.application.delete({
                where: { id: applicationId }
            });

            logger.info('Application deleted', { applicationId, userId });

            return Result.ok(undefined);
        } catch (error) {
            logger.error('Error deleting application',  { error, userId, applicationId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get statistics for user's applications
     */
    async getStats(userId: string): AsyncResult<any, Error> {
        try {
            const [total, byStatus, byPriority] = await Promise.all([
                prisma.application.count({ where: { userId }}),
                prisma.application.groupBy({
                    by: ['status'],
                    where: { userId },
                    _count: true
                }),
                prisma.application.groupBy({
                    by: ['priority'],
                    where: { userId },
                    _count: true
                })
            ]);

            return Result.ok({
                total,
                byStatus,
                byPriority
            });
        } catch (error) {
            logger.error('Error fetching application stats', { error, userId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get dashboard analytics
     */
    async getDashboardAnalytics(userId: string): AsyncResult<any, Error> {
        try {
            const [
                applications,
                statusBreakdown,
                priorityBreakdown,
                recentApplications
            ] = await Promise.all([
                // get all applications with counts
                prisma.application.findMany({
                    where: { userId },
                    include: {
                        company: {
                            select: {
                                name: true
                            }
                        },
                        _count: {
                            select: {
                                contacts: true,
                                activities: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),

                // status breakdown
                prisma.application.groupBy({
                    by: ['status'],
                    where: { userId },
                    _count: true
                }),

                // priority breakdown
                prisma.application.groupBy({
                    by: ['priority'],
                    where: { userId },
                    _count: true
                }),

                // recent applications (last 7 days)
                prisma.application.count({
                    where: {
                        userId,
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                })
            ]);

            // calculate success rate
            const totalApps = applications.length;
            const acceptedApps = applications.filter((app) => app.status === 'ACCEPTED').length;
            const successRate = totalApps > 0 ? ((acceptedApps / totalApps) * 100).toFixed(1): '0.0';

            return Result.ok({
                summary: {
                    total: totalApps,
                    recentWeek: recentApplications,
                    successRate: `${successRate}%`
                },
                byStatus: statusBreakdown,
                byPriority: priorityBreakdown,
                applications: applications.map((app) => ({
                    id: app.id,
                    jobTitle: app.jobTitle,
                    company: app.company.name,
                    status: app.status,
                    priority: app.priority,
                    contactCount: app._count.contacts,
                    activityCount: app._count.activities,
                    createdAt: app.createdAt
                }))
            });
        } catch (error) {
            logger.error('Error fetching dashboard analytics', { error, userId });

            return Result.fail(error as Error);
        }
    }
}
