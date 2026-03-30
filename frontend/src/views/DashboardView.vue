<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold">
            Dashboard
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="card">
                <h3 class="text-sm font-medium text-gray-600 mb-2">
                    Total Applications
                </h3>

                <p class="text-3xl font-bold text-gray-900">
                    0
                </p>
            </div>

            <div class="card">
                <h3 class="text-sm font-medium text-gray-600 mb-2">
                    Companies
                </h3>

                <p class="text-3xl font-bold text-gray-900">
                    {{ companyStore.companies.length }}
                </p>
            </div>

            <div class="card">
                <h3 class="text-sm font-medium text-gray-600 mb-2">
                    Interviews
                </h3>

                <p class="text-3xl font-bold text-gray-900">
                    0
                </p>
            </div>
        </div>

        <div class="card">
            <h3 class="text-lg font-semibold mb-4">
                Welcome to Job Tracker
            </h3>

            <div class="mt-4 flex gap-4">
                <router-link to="/companies" class="btn btn-primary">
                    Add Company
                </router-link>

                <router-link to="/applications" class="btn btn-secondary">
                    Add Application
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCompanyStore } from '@/stores/company.store';

const companyStore = useCompanyStore();

onMounted(() => {
    companyStore.fetchCompanies();
});
</script>
