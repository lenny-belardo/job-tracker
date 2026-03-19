import { CompanyService } from '../company.service';
import prisma from '@/config/database';
import { createMockUser, createMockCompany } from '@/__tests__/helpers/test-data';

// mock prisma
jest.mock('@/config/database', () => ({
    __esModule: true,
    default: {
        company: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn()
        }
    }
}));

describe('CompanyService', () => {
    let companyService: CompanyService;
    const mockUser = createMockUser();

    beforeEach(() => {
        companyService = new CompanyService();

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a company successfully', async () => {
            const companyData = {
                name: 'Google',
                industry: 'Technology'
            };

            const mockCompany = createMockCompany(mockUser.id, companyData);

            (prisma.company.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.company.create as jest.Mock).mockResolvedValue(mockCompany);

            const result = await companyService.create(mockUser.id, companyData);

            expect(result.isSuccess()).toBe(true);
            expect(result.getValue()).toEqual(mockCompany);
            expect(prisma.company.create).toHaveBeenCalledWith({
                data: {
                    ...companyData,
                    userId: mockUser.id
                }
            });
        });

        it('should fail if company name already exists for user', async () => {
            const companyData = {
                name: 'Google',
                industry: 'Technology'
            };

            const existingCompany = createMockCompany(mockUser.id, companyData);
            (prisma.company.findFirst as jest.Mock).mockResolvedValue(existingCompany);

            const result = await companyService.create(mockUser.id, companyData);

            expect(result.isFailure()).toBe(true);
            expect(result.getError().message).toContain('already exists');
            expect(prisma.company.create).not.toHaveBeenCalled();
        });

        it('should handle database errors', async () => {
            const companyData = {
                name: 'Google',
                industry: 'Technology'
            };

            (prisma.company.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.company.create as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await companyService.create(mockUser.id, companyData);

            expect(result.isFailure()).toBe(true);
            expect(result.getError().message).toBe('Database error');
        });
    });
});
