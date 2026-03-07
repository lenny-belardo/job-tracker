export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T,
    error?: ApiError;
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
    data: T[];
    pagiantion: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
