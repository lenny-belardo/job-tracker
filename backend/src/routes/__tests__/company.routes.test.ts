import request from 'supertest';
import app from '@/index';
import prisma from '@/config/database';
import { generateAccessToken } from '@/utils/jwt';
import { createMockUser, createMockCompany } from '@/__tests__/helpers/test-data';

// mock prisma
jest.mock('@/config/database');

describe('Company Routes', () => {
    let authToken : string;
    const mockUser = createMockUser();

    beforeAll(() => {
        authToken = generateAccessToken(mockUser.id);
    });

    beforeEach(() => {
        jest.clearAllMocks();
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
});
