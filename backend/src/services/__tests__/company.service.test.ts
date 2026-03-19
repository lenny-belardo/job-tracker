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

    describe('findAll', () => {
        it('should return paginated companies', async () => {
            const mockCompanies = [
                createMockCompany(mockUser.id, { name: 'Company 1' }),
                createMockCompany(mockUser.id, { name: 'Company 2' })
            ];

            (prisma.company.findMany as jest.Mock).mockResolvedValue(mockCompanies);
            (prisma.company.count as jest.Mock).mockResolvedValue(2);

            const result = await companyService.findAll(mockUser.id, {
                page: 1,
                limit: 10,
                sortBy: 'name',
                sortOrder: 'asc'
            });

            expect(result.isSuccess()).toBe(true);

            const value = result.getValue();

            expect(value.data).toEqual(mockCompanies);
            expect(value.pagination.total).toBe(2);
            expect(value.pagination.page).toBe(1);
            expect(value.pagination.hasNext).toBe(false);
        });

        it('should filter by search term', async () => {
            const mockCompanies = [createMockCompany(mockUser.id, { name: 'Google' })];

            (prisma.company.findMany as jest.Mock).mockResolvedValue(mockCompanies);
            (prisma.company.count as jest.Mock).mockResolvedValue(1);

            const result = await companyService.findAll(mockUser.id, {
                page: 1,
                limit: 10,
                search: 'google',
                sortBy: 'name',
                sortOrder: 'asc'
            });

            expect(result.isSuccess()).toBe(true);
            expect(prisma.company.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ name: { contains: 'google', mode: 'insensitive' }})
                        ])
                    })
                })
            );
        });
    });

    describe('findById', () => {
        it('should return company by id', async () => {
            const mockCompany = createMockCompany(mockUser.id);
            (prisma.company.findFirst as jest.Mock).mockResolvedValue(mockCompany);

            const result = await companyService.findById(mockUser.id, mockCompany.id);

            expect(result.isSuccess()).toBe(true);
            expect(result.getValue()).toBe(mockCompany);
        });

        it('should fail if company not found', async () => {
            (prisma.company.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await companyService.findById(mockUser.id, 'non-existent');

            expect(result.isFailure()).toBe(true);
            expect(result.getError().message).toContain('not found');
        });
    });

    describe('update', () => {
        it('should update company successfully', async () => {
            const mockCompany = createMockCompany(mockUser.id);
            const updateData = { rating: 5, notes: 'Great company' };

            (prisma.company.findFirst as jest.Mock).mockResolvedValue(mockCompany);
            (prisma.company.update as jest.Mock).mockResolvedValue({
                ...mockCompany,
                ...updateData
            });

            const result = await companyService.update(mockUser.id, mockCompany.id, updateData);

            expect(result.isSuccess()).toBe(true);
            expect(result.getValue().rating).toBe(5);
            expect(result.getValue().notes).toBe('Great company');
        });

        it('should fail if company not found', async () => {
            (prisma.company.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await companyService.update(mockUser.id, 'non-existent', { rating: 5 });

            expect(result.isFailure()).toBe(true);
            expect(prisma.company.update).not.toHaveBeenCalled();
        });
    });
});
