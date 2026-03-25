import { defineStore } from 'pinia';
import { ref } from 'vue';
import { companiesApi, type CompanyFilters, type CreateCompanyData } from '@/api/companies.api';
import type { Company, PaginationMeta } from '@/types';

export const useCompanyStore = defineStore('company', () => {
    const companies = ref<Company[]>([]);
    const currentCompany = ref<Company | null>(null);
    const pagination = ref<PaginationMeta | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    async function fetchCompanies(filters: CompanyFilters = {}) {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await companiesApi.getAll(filters);

            companies.value = response.data;
            pagination.value = response.pagination;
        } catch (err: any) {
            error.value = err.response?.data?.error?.message || 'Failed to fetch companies';
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchCompany(id: string) {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await companiesApi.getById(id);
            currentCompany.value = response.data;
        } catch (err: any) {
            error.value = err.response?.data?.error?.message || 'Failed to fetch company';
        } finally {
            isLoading.value = false;
        }
    }

    async function createCompany(data: CreateCompanyData) {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await companiesApi.create(data);
            companies.value.unshift(response.data);

            return true;
        } catch (err: any) {
            error.value = err.response?.data?.error?.message || 'Failed to create company';

            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateCompany(id: string, data: Partial<CreateCompanyData>) {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await companiesApi.update(id, data);
            const index = companies.value.findIndex((c) => c.id === id);

            if (index !== -1) {
                companies.value[index] = response.data;
            }

            if (currentCompany.value?.id === id) {
                currentCompany.value = response.data;
            }

            return true;
        } catch (err: any) {
            error.value = err.response?.data?.error?.message || 'Failed to update company';

            return false;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        createCompany,
        fetchCompanies,
        fetchCompany,
        updateCompany
    };
});
