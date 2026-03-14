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

export interface UpdateActivityData extends Partial<Omit<CreateActivityData, 'aplicationId'>> {}

export class AcivityService {
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
                description: data.descritption,
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
}
