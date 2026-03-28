<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div class="max-w-md w-full">
            <div class="card">
                <h1 class="text-3xl font-bold text-center mb-8">Create Account</h1>

                <form @submit.prevent="handleRegister" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">
                            First Name
                        </label>

                        <input
                            v-model="firstName"
                            type="text"
                            required
                            class="input"
                            placeholder="John"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">
                            Last Name
                        </label>

                        <input
                            v-model="lastName"
                            type="text"
                            required
                            class="input"
                            placeholder="Doe"
                        />
                    </div>

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
                            minlength="6"
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
                        {{ authStore.isLoading ? 'Creating account...' : 'Register' }}
                    </button>
                </form>

                <p class="text-center mt-4 text-sm text-gray-600">
                    Already have an account?

                    <router-link to="/login" class="text-primary-600 hover:underline">
                        Login
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

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');

async function handleRegister() {
    const success = await authStore.register({
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value
    });

    if (success) {
        router.push('/');
    }
}
</script>
