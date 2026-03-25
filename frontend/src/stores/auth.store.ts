import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authApi } from '@/api/auth.api';
import type { User, LoginCredentials, RegisterData } from '@/types';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

    async function login(credentials: LoginCredentials) {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await authApi.login(credentials);
            
            user.value = response.data.user;
            accessToken.value = response.data.accessToken;

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            return true;
        } catch (err: any) {
            error.value = err.response?.data?.error?.message || 'Login failed';

            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function register(data: RegisterData) {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await authApi.register(data);

            user.value = response.data.user;
            accessToken.value = response.data.accessToken;

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            return true;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Registration failed';

            return false;
        } finally {
            isLoading.value = false;
        }
    }

    function logout() {
        user.value = null;
        accessToken.value = null;

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    return {
        login,
        logout,
        register
    };
});
