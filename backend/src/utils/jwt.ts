import jwt from 'jsonwebtoken';
import logger from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Validate secrets on startup
if (process.env.NODE_ENV === 'production') {
    if (JWT_SECRET === 'fallback-secret' || JWT_REFRESH_SECRET === 'fallback-refresh') {
        throw new Error('JWT secrets must be set in production!');
    }
}

interface JwtPayload {
    userId: string;
    iat?: number;
    exp?: number;
}

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
}

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN
    });
}

/**
 * Verifiy access token
 * @throws Error if token is invalid or expired
 */
export const verifyAccessToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            logger.warn('Access token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            logger.warn('Invalid access token');
        }

        throw error; // Re-throw so caller can handle
    }
}

/**
 * Verify referesh token
 * Return payload or null, with proper error logging
 */
export const verifyRefreshToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            logger.info('Refresh token expired - user needs to loggin again');
        } else if (error instanceof jwt.JsonWebTokenError) {
            logger.warn('Invalid refresh token - possible attack?', { error });
        } else {
            logger.error('Unknown error verifying refresh token', { error });
        }

        return null;
    }
}

/** 
 * Decode token without verfification (for debugging) 
 */
export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch {
        return null;
    }
}
