import request from 'supertest';
import app from '@/index';
import prisma from '@/config/database';
import { generateAccessToken } from '@/utils/jwt';
import { createMockUser, createMockCompany } from '@/__tests__/helpers/test-data';

// mock prisma
jest.mock('@/config/database', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn()
        },
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

describe('Company Routes', () => {
    let authToken : string;
    const mockUser = createMockUser();

    beforeAll(() => {
        authToken = generateAccessToken(mockUser.id);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // mock user lookup used by auth middleware
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    });

    describe('POST /api/companies', () => {
        it('should create a company with valid data', async () => {
            const companyData = {
                name: 'Google',
                industry: 'Technology',
                website: 'https://google.com'
            };

            const mockCompany = createMockCompany(mockUser.id, companyData);

            (prisma.company.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.company.create as jest.Mock).mockResolvedValue(mockCompany);

            const response = await request(app)
                .post('/api/companies')
                .set('Authorization', `Bearer ${authToken}`)
                .send(companyData);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Google');
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/companies')
                .send({ name: 'Google', industry: 'Tech' });

            expect(response.status).toBe(401);
        });

        it('should fail with invalid data', async () => {
            const response = await request(app)
                .post('/api/companies')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: '' });

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('GET /api/companies', () => {
        it('should return paginated companies', async () => {
            const mockCompanies = [
                createMockCompany(mockUser.id, { name: 'Google' }),
                createMockCompany(mockUser.id, { name: 'Microsoft' })
            ];

            (prisma.company.findMany as jest.Mock).mockResolvedValue(mockCompanies);
            (prisma.company.count as jest.Mock).mockResolvedValue(2);

            const response = await request(app)
                .get('/api/companies?page=1&limit=10')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.pagination.total).toBe(2);
        });

        it('should filter by search term', async () => {
            const mockCompanies = [createMockCompany(mockUser.id, { name: 'Google' })];

            (prisma.company.findMany as jest.Mock).mockResolvedValue(mockCompanies);
            (prisma.company.count as jest.Mock).mockResolvedValue(1);

            const response = await request(app)
                .get('/api/companies?search=google')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].name).toBe('Google');
        });
    });

    describe('GET /api/companies/:id', () => {
        it('should return company by id', async () => {
            const mockCompany = createMockCompany(mockUser.id);

            (prisma.company.findFirst as jest.Mock).mockResolvedValue(mockCompany);

            const response = await request(app)
                .get(`/api/companies/${mockCompany.id}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe(mockCompany.id);
        });

        it('should return 404 for non-existent company', async () => {
            (prisma.company.findFirst as jest.Mock).mockResolvedValue(null);

            const response = await request(app)
                .get('/api/companies/non-existent')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });
    });
});
