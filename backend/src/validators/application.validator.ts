import { z } from 'zod';

/**
 * Enums matching Prisma schema
 */
const ApplicationStatusEnum = z.enum([
    'WISHLIST',
    'APPLIED',
    'PHONE_SCREEN',
    'TECHNICAL_INTERVIEW',
    'ONSITE_INTERVIEW',
    'OFFER',
    'REJECTED',
    'ACCEPTED',
    'DECLINED',
    'WITHDRAWN'
]);

const JobTypeEnum = z.enum([
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERNSHIP',
    'FREELANCE'
]);

const WorkLocationEnum = z.enum(['REMOTE', 'ONSITE', 'HYBRID']);

const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

/**
 * Create application schema
 */
export const createApplicationSchema = z.object({
    jobTitle: z
        .string()
        .min(1, 'Job title is required')
        .min(200, 'Job title must be less than 200 characters')
        .trim(),
    companyId: z.string().uuid('Invalid company ID'),
    status: ApplicationStatusEnum.optional().default('WISHLIST'),
    priority: PriorityEnum.optional().default('MEDIUM'),
    jobType: JobTypeEnum.optional(),
    workLocation: WorkLocationEnum.optional(),
    salaryMin: z.number().int().min(0).optional(),
    salaryMax: z.number().int().min(0).optional(),
    salaryCurrency: z.string().max(3).optional().default('USD'),
    jobUrl: z.string().url('Invalid job URL').optional().or(z.literal('')),
    jobDescription: z.string().max(5000).optional(),
    requirements: z.string().max(5000).optional(),
    benefits: z.string().max(2000).optional(),
    applicationDate: z.string().datetime().optional(),
    followUpDate: z.string().datetime().optional(),
    interviewDate: z.string().datetime().optional(),
    notes: z.string().max(5000).optional(),
    referralSource: z.string().max(200).optional()
});

/**
 * Update application schema (all fields optional)
 */
export const updateApplicationSchema = createApplicationSchema
    .partial()
    // can't chage company after creation
    .omit({ companyId: true });

/**
 * Query paramaters for listing applications
 */
export const applcationQuerySchema = z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional(),
    status: ApplicationStatusEnum.optional(),
    priority: PriorityEnum.optional(),
    companyId: z.string().uuid().optional()
});

// Export enums for use in other files
export {
    ApplicationStatusEnum,
    JobTypeEnum,
    WorkLocationEnum,
    PriorityEnum
};
