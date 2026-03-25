import apiClient from './client';
import type { Company, PaginatedResponse } from '@/types';

export interface CompanyFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc'
}

export interface CreateCompanyData {
    name: string;
    industry?: string;
    website?: string;
    location?: string;
    rating?: number;
    notes?: string;
}


export const companiesApi = {
    async getAll(filters: CompanyFilters = {}): Promise<PaginatedResponse<Company>> {
        const response = await apiClient.get<PaginatedResponse<Company>>('/companies', {
            params: filters
        });

        return response.data;
    },

    async getById(id: string): Promise<{ success: boolean, data: Company }> {
        const response = await apiClient.get(`/companies/${id}`);

        return response.data;
    },

    async create(data: CreateCompanyData): Promise<{ success: boolean; data: Company }> {
        const response = await apiClient.post('/companies', data);

        return response.data;
    },

    async update(id: string, data: Partial<CreateCompanyData>): Promise<{ success: boolean, data: Company }> {
        const response = await apiClient.put(`/companies/${id}`, data);

        return response.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/companies/${id}`);
    }
};
