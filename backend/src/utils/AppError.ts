export enum ErrorCode {
    BAD_REQUEST = 'BAD_REQUEST',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR'
}

export interface ErrorDetails {
    field?: string;
    value?: unknown;
    [key: string]: unknown;
}

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: ErrorDetails;

    constructor(
        message: string,
        code: ErrorCode = ErrorCode.INTERNAL_ERROR,
        statusCode: number = 500,
        isOperational: boolean = true,
        details?: ErrorDetails
    ) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);

        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request', details?: ErrorDetails) {
        super(message, ErrorCode.BAD_REQUEST, 400, true, details);
    }
}

export class Unauthorized extends AppError {
    constructor(message: string = 'Unauthorized', details?: ErrorDetails) {
        super(message, ErrorCode.UNAUTHORIZED, 401, true, details);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource', details?: ErrorDetails) {
        super(`${resource} not found`, ErrorCode.NOT_FOUND, 404, true, details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource conflict', details?: ErrorDetails) {
        super(message, ErrorCode.CONFLICT, 409, true, details);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation failed', details?: ErrorDetails) {
        super(message, ErrorCode.VALIDATION_ERROR, 422, true, details);
    }
}
