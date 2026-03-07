import { z } from 'zod';

/**
 * Create company schema
 */
export const createCompanySchema = z.object({
    name: z
        .string()
        .min(1, 'Company name is required')
        .max(100, 'Company name must be less than 100 characters')
        .trim(),
    website: z
        .string()
        .url('Invalid website URL')
        .optional()
        .or(z.literal('')),
    industry: z
        .string()
        .max(50, 'Industry must be at less than 50 characters')
        .optional(),
    location: z
        .string()
        .max(100, 'Location must be at less than 100 characters')
        .optional(),
    size: z
        .string()
        .max(50, 'Size must be less than 50 characters')
        .optional(),
    description: z
        .string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional(),
    notes: z
        .string()
        .max(2000, 'Notes must be less than 2000 characters')
        .optional(),
    rating: z
        .number()
        .int()
        .min(0, 'Rating must be at least 0')
        .max(5, 'Rating must be at most 5')
        .optional()
});

/**
 * Update company schema (all fields optional)
 */
export const updateCompanySchema = createCompanySchema.partial();

/**
 * Query parameters for listing companies
 */
export const companyQuerySchema = z.object({
    page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional()
});

// Export types
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanyQueryInput = z.infer<typeof companyQuerySchema>;
