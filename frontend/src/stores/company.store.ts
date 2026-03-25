import { defineStore } from 'pinia';
import { ref } from 'vue';
import { companiesApi, type CompanyFilters } from '@/api/companies.api';
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

    return {
        fetchCompanies,
        fetchCompany
    };
});
