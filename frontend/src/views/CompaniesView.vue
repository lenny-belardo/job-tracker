<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold">
                Companies
            </h2>

            <button @click="showCreateModal = true" class="btn btn-primary">
                + Add Company
            </button>
        </div>

        <LoadingSpinner v-if="companyStore.isLoading" />
        <ErrorMessage :message="companyStore.error" />

        <div v-if="!companyStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
                v-for="company in companyStore.companies"
                :key="company.id"
                class="card hover:shadow-md transition-shadow"
            >
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">
                            {{ company.name }}
                        </h3>

                        <p v-if="company.industry" class="text-sm text-gray-600">
                            {{ company.industry }}
                        </p>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="text-yellow-500">
                            ⭐
                        </span>

                        <span class="font-medium">
                            {{ company.rating }}
                        </span>
                    </div>
                </div>

                <div class="space-y-2 text-sm">
                    <p v-if="company.location" class="text-gray-600">
                        📍 {{ company.location }}
                    </p>

                    <p v-if="company.website" class="text-primary-600 truncate">
                        <a :href="company.website" target="_blank" class="hover:underline">
                            {{ company.website }}
                        </a>
                    </p>
                </div>

                <div class="mt-4 flex gap-2">
                    <button @click="editCompany(company)" class="btn btn-secondary text-sm flex-1">
                        Edit
                    </button>

                    <button @click="deleteCompany(company.id)" class="btn btn-secondary text-sm">
                        Delete
                    </button>
                </div>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useCompanyStore } from '@/stores/company.store';
import type { Company } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import ErrorMessage from '@/components/ui/ErrorMessage.vue';

const companyStore = useCompanyStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingCompanyId = ref<string | null>(null);

const form = reactive({
    name: '',
    industry: '',
    website: '',
    location: '',
    rating: 3,
    notes: ''
});

function resetForm() {
    form.name = '';
    form.industry = '';
    form.website = '';
    form.location = '';
    form.rating = 3;
    form.notes = '';
}

function closeModals() {
    showCreateModal.value = false;
    showEditModal.value = false;
    editingCompanyId.value = null;

    resetForm();
}

function editCompany(company: Company) {
    form.name = company.name;
    form.industry = company.industry || '';
    form.website = company.website || '';
    form.location = company.location || '';
    form.rating = company.rating;
    form.notes = company.notes || '';

    editingCompanyId.value = company.id;
    showEditModal.value = true;
}

async function handleSubmit() {
    const data = {
        name: form.name,
        industry: form.industry || undefined,
        website: form.website || undefined,
        location: form.location || undefined,
        rating: form.rating,
        notes: form.notes || undefined
    };

    let success = false;

    if (showEditModal.value && editingCompanyId.value) {
        success = await companyStore.updateCompany(editingCompanyId.value, data);
    } else {
        success = await companyStore.createCompany(data);
    }

    if (success) {
        closeModals();
    }
}

async function deleteCompany(id: string) {
    if (confirm('Are you sure you want to delete this company?')) {
        await companyStore.deleteCompany(id);
    }
}

onMounted(() => {
    companyStore.fetchCompanies();
});
</script>
