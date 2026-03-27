<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div class="max-w-md w-full">
            <div class="card">
                <h1 class="text-3xl font-bold text-center mb-8">
                    Job Tracker
                </h1>

                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">
                            Email
                        </label>

                        <input
                            v-model="email"
                            type="email"
                            required
                            class="input"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">
                            Password
                        </label>

                        <input
                            v-model="password"
                            type="password"
                            required
                            class="input"
                            placeholder="••••••••"
                        />
                    </div>

                    <div v-if="authStore.error" class="text-red-600 text-sm">
                        {{ authStore.error }}
                    </div>

                    <button
                        type="submit"
                        :disabled="authStore.isLoading"
                        class="btn btn-primary w-full"
                    >
                        {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
                    </button>
                </form>

                <p class="text-center mt-4 text-sm text-gray-600">
                    Don't have an account?

                    <router-link to="/register" class="text-primary-600 hover:underline">
                        Register
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

async function handleLogin() {
    const success = await authStore.login({
        email: email.value,
        password: password.value
    });

    if (success) {
        router.push('/');
    }
}
</script>
