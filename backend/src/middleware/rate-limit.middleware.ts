import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP 
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later' 
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Strict rate limiter for auth endpoints
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts, please try again later'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Count all requests (including successful ones)
    skipSuccessfulRequests: false
});
