export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    }
}

export interface Company {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    location?: string;
    rating: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        applications: number;
    }
}

export interface Application {
    id: string;
    jobTitle: string;
    companyId: string;
    company?: Company;
    status: ApplicationStatus;
    priority: ApplicationPriority;
    applicationDate: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export type ApplicationStatus =
    | 'WISHLIST'
    | 'APPLIED'
    | 'INTERVIEWING'
    | 'OFFERED'
    | 'REJECTED'
    | 'ACCEPTED';

export type ApplicationPriority =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH';

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: PaginationMeta
}
