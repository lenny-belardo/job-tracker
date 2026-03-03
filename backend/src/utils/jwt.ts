import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

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
 */
export const verifyAccessToken = (token: string): { userId: string } => {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
}

/**
 * Verify referesh token
 */
export const verifyRefreshToken = (token: string): { userId: string } | null => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    } catch {
        return null;
    }
}
