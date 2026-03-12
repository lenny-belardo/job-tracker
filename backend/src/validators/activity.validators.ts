import { z } from 'zod';

/**
 * Activity type enum
 */
const ActivityTypeEnum = z.enum([
    'NOTE',
    'EMAIL',
    'CALL',
    'INTERVIEW',
    'FOLLOW_UP',
    'MEETING',
    'RESEARCH',
    'OTHER'
]);

/**
 * Create activity schema
 */
export const createActivitySchema = z.object({
    applicationId: z.string().uuid('Invalid application ID'),
    type: ActivityTypeEnum,
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters')
        .trim(),
    description: z
        .string()
        .max(5000, 'Description must be less than 500 characters')
        .optional(),
    activityDate: z.string().datetime().optional()
});

/**
 * Update activity schema
 */
export const updateActivitySchema = createActivitySchema
    .partial()
    .omit({ applicationId: true });

// export types and enum
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export { ActivityTypeEnum };
