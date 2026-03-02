export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    isEmailVerified: boolean;
    isActive: boolean;
    lastLoginAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserDTO {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: Omit<User, 'password'>;
    tokens: {
        accessToken: string;
        refreshToken: string;
    }
}