import { User } from '@prisma/client';

export const createMockUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-123',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
});

export const createMockCompany = (userId: string, overrides: {}) => ({
    id: 'company-123',
    name: 'Test Company',
    industry: 'Technology',
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    website: null,
    location: null,
    size: null,
    description: null,
    logoUrl: null,
    notes: null,
    rating: 0,
    ...overrides
});

export const createMockApplication = (userId: string, companyId: string, overrides: {}) => ({
    id: 'app-123',
    jobTitle: 'Software Engineer',
    companyId,
    userId,
    status: 'APPLIED' as const,
    priority: 'MEDIUM' as const,
    jobType: 'FULL_TIME' as const,
    workLocation: 'REMOTE' as const,
    salaryMin: 100000,
    salaryMax: 150000,
    salaryCurrency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
    jobUrl: null,
    jobDescription: null,
    requirements: null,
    benefits: null,
    applicationDate: new Date(),
    followUpDate: null,
    interviewDate: null,
    offerDate: null,
    rejectionDate: null,
    notes: null,
    resumeUrl: null,
    coverLetterUrl: null,
    referralSource: null,
    ...overrides
});
