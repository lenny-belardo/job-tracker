import { z } from 'zod';

/**
 * Create contact schema
 */
export const createContactSchema = z.object({
    applicationId: z.string().uuid('Invalid application ID'),
    name: z
        .string()
        .min(1, 'Contact name is required')
        .max(100, 'Name must be less than 100 characters')
        .trim(),
    email: z
        .string()
        .email('Invalid email address')
        .optional()
        .or(z.literal('')),
    phone: z
        .string()
        .max(20, 'Phone must be less than 20 characters')
        .optional(),
    role: z
        .string()
        .max(20, 'Phone must be less than 100 characters')
        .optional(),
    linkedinUrl: z
        .string()
        .url('Invalid LinkedIn URL')
        .optional()
        .or(z.literal('')),
    notes: z
        .string()
        .max(1000, 'Notes must be less than 1000 characters')
        .optional(),
    isPrimary: z.boolean().optional().default(false)
});

/**
 * Update contact schema
 */
export const updateContactSchema = createContactSchema
    .partial()
    .omit({ applicationId: true })

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
