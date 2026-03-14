import { Activity } from '@prisma/client';
import { AsyncResult, Result } from '@/utils/Result';
import { NotFoundError } from '@/utils/errors/AppError';
import prisma from '@/config/database';
import logger from '@/utils/logger';

export interface CreateActivityData {
    applicationId: string;
    type: string;
    title: string;
    description?: string;
    activityDate?: string;
}

export interface UpdateActivityData extends Partial<Omit<CreateActivityData, 'applicationId'>> {}

export class ActivityService {
    /**
     * Create a new activity
     */
    async create(
        userId: string,
        data: CreateActivityData
    ): AsyncResult<Activity, Error> {
        try {
            // verify application belongs to user
            const application = await prisma.application.findFirst({
                where: {
                    id: data.applicationId,
                    userId
                }
            });

            if (!application) {
                return Result.fail(new NotFoundError('Application'));
            }

            const activityData: any = {
                type: data.type,
                title: data.title,
                description: data.description,
                applicationId: data.applicationId
            }

            if (data.activityDate) {
                activityData.activityDate = new Date(data.activityDate)
            }

            const activity = await prisma.activity.create({
                data: activityData
            });

            logger.info('Activity created', { activityId: activity.id, userId });

            return Result.ok(activity);
        } catch (error) {
            logger.error('Error creating activity', { error, userId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get all activities for an application
     */
    async findByApplication(
        userId: string,
        applicationId: string
    ): AsyncResult<Activity[], Error> {
        try {
            // verify application belongs to user
            const application = await prisma.application.findFirst({
                where: {
                    id: applicationId,
                    userId
                }
            });

            if (!application) {
                return Result.fail(new NotFoundError('Application'));
            }

            const activities = await prisma.activity.findMany({
                where: { applicationId },
                orderBy: { activityDate: 'desc' }
            });

            return Result.ok(activities);
        } catch (error) {
            logger.error('Error fetching activities', { error, userId, applicationId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get a single activity by ID
     */
    async findById(
        userId: string,
        activityId: string
    ): AsyncResult<Activity, Error> {
        try {
            const activity = await prisma.activity.findFirst({
                where: {
                    id: activityId,
                    application: {
                        userId
                    }
                }
            });

            if (!activity) {
                return Result.fail(new NotFoundError('Activity'));
            }

            return Result.ok(activity);
        } catch (error) {
            logger.error('Error fetching activity', { error, userId, activityId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Update an activity
     */
    async update(
        userId: string,
        activityId: string,
        data: UpdateActivityData
    ): AsyncResult<Activity, Error> {
        try {
            // verify activity belongs to user's application
            const existingActivity = await prisma.activity.findFirst({
                where: {
                    id: activityId,
                    application: {
                        userId
                    }
                }
            });

            if (!existingActivity) {
                return Result.fail(new NotFoundError('Activity'));
            }

            const updateData: any = {
                ...(data.type && { type: data.type }),
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description })
            };

            if (data.activityDate) {
                updateData.activityDate = new Date(data.activityDate);
            }

            const activity = await prisma.activity.update({
                where: { id: activityId },
                data: updateData
            });

            logger.info('Activity updated', { activityId, userId });

            return Result.ok(activity);
        } catch (error) {
            logger.error('Error updating activity', { error, userId, activityId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Delete an activity
     */
    async delete(
        userId: string,
        activityId: string
    ): AsyncResult<void, Error> {
        try {
            const activity = await prisma.activity.findFirst({
                where: {
                    id: activityId,
                    application: {
                        userId
                    }
                }
            });

            if (!activity) {
                return Result.fail(new NotFoundError('Activity'));
            }

            await prisma.activity.delete({
                where: { id: activityId }
            });

            logger.info('Activity deleted', { activityId, userId });

            return Result.ok(undefined);
        } catch (error) {
            logger.error('Error deleting activity', { error, userId, activityId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get recent activities for user (timeline)
     */
    async getRecentActivities(
        userId: string,
        limit: number = 20
    ): AsyncResult<Activity[], Error> {
        try {
            const activities = await prisma.activity.findMany({
                where: {
                    application: {
                        userId
                    }
                },
                include: {
                    application: {
                        select: {
                            id: true,
                            jobTitle: true,
                            company: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: { activityDate: 'desc' },
                take: limit
            });

            return Result.ok(activities as any);
        } catch (error) {
            logger.error('Error fetching recent activities',  { error, userId });

            return Result.fail(error as Error);
        }
    }
}
