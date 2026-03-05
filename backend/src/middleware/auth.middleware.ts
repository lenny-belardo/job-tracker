import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import prisma from '@/config/database';
import logger from '@/utils/logger';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'No token provided'
                }
            });

            return;
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify token
        const { userId } = verifyAccessToken(token);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                isEmailVerified: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User not found'
                }
            });

            return;
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Account is deactivated'
                }
            });

            return;
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        logger.error('Authentication error', { error });

        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Invalid token'
            }
        });
    }
};
