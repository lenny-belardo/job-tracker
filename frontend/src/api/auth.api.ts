import apiClient from './client';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';

export const authApi = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

        return response.data;
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);

        return response.data;
    },

    async getProfile(): Promise<{ success: boolean; data: User }> {
        const response = await apiClient.get('/auth/profile');

        return response.data;
    },

    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
    }
};
