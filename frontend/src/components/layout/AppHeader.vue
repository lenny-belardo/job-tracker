<template>
    <header class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-900">
                Job Tracker
            </h1>

            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">
                    {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                </span>

                <button
                    @click="handleLogout"
                    class="btn btn-secondary text-sm"
                >
                    Logout
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { useRouter} from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
    authStore.logout();

    router.push('/login');
}
</script>
