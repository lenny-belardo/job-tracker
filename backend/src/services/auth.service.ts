import { User } from '@prisma/client';
import { AsyncResult, Result } from '@/utils/Result';
import { hashPassword, comparePassword } from '@/utils/password';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from '@/utils/jwt';
import {
    UnauthorizedError,
    ConflictError,
    NotFoundError
} from '@/utils/errors/AppError';
import prisma from '@/config/database';
import type { CreateUserDTO, LoginDTO, AuthResponse } from '@job-tracker/shared';
import logger from '@/utils/logger';

export class AuthService {
    /**
     * Register a new User
     */
    async register(data: CreateUserDTO): AsyncResult<AuthResponse, Error> {
        try {
            // Check if email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });

            if (existingUser) {
                return Result.fail(
                    new ConflictError('Email already registered', { email: data.email })
                )
            }

            // Hash password
            const hashedPassword = await hashPassword(data.password);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    firstName: data.firstName,
                    lastName: data.lastName
                }
            });

            // Generate tokens
            const accessToken = generateAccessToken(user.id);
            const refreshToken = generateRefreshToken(user.id);

            // Store refresh token in database
            await this.storeRefreshToken(user.id, refreshToken);

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            logger.info('User registered successfully', {
                userId: user.id,
                email: user.email
            });

            return Result.ok({
                user: userWithoutPassword,
                tokens: { accessToken, refreshToken }
            });
        } catch (error) {
            logger.error('Error during registration', { error, email: data.email });

            return Result.fail(error as Error);
        }
    }

    /**
     * Login user
     */
    async login(data: LoginDTO): AsyncResult<AuthResponse, Error> {
        try {
            // Find user by email
            const user = await prisma.user.findUnique({
                where: { email: data.email }
            });

            if (!user) {
                logger.warn('Login attempt with non-existent email', { email: data.email });

                return Result.fail(new UnauthorizedError('Invalid credentials'));
            }

            // Check if account is active
            if (!user.isActive) {
                logger.warn('Login attempt on deactivated account',  {
                    userId: user.id,
                    email: data.email
                });

                return Result.fail(new UnauthorizedError('Account is deactivated'));
            }

            // Verify password
            const isValidPassword = await comparePassword(data.password, user.password);

            if (!isValidPassword) {
                logger.warn('Login attempt with incorrect password', { email: data.email });

                return Result.fail(new UnauthorizedError('Invalid credentials'));
            }

            // Generate tokens
            const accessToken = generateAccessToken(user.id);
            const refreshToken = generateRefreshToken(user.id);

            // Store refresh token
            await this.storeRefreshToken(user.id, refreshToken);

            // Update last login timestamp
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            logger.info('User logged in successfully', { userId: user.id, email: user.email });

            return Result.ok({
                user: userWithoutPassword,
                tokens: { accessToken, refreshToken}
            });
        } catch (error) {
            logger.error('Error during login', { error, email: data.email });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get user profile
     */
    async getProfile(userId: string): AsyncResult<Omit<User, 'password'>, Error> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return Result.fail(new NotFoundError('User'));
            }

            const { password: _, ...userWithoutPassword } = user;

            return Result.ok(userWithoutPassword);
        } catch (error) {
            logger.error('Error fetching profile', { error: userId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): AsyncResult<{ accessToken: string }, Error> {
        try {
            // Verify refresh token
            const payload = verifyRefreshToken(refreshToken);

            if (!payload) {
                return Result.fail(new UnauthorizedError('Invalid or expired refresh token'));
            }

            // Check if refresh token exists in database
            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: refreshToken }
            });

            if (!storedToken) {
                logger.warn('Refresh token not found in database', { userId: payload.userId });

                return Result.fail(new UnauthorizedError('Refresh token not found'));
            }

            // Check if token is expired
            if (storedToken.expiresIn < new Date()) {
                // Clean up expired token
                await prisma.refreshToken.delete({
                    where: { token: refreshToken }
                });

                logger.info('Expired refresh token removed', { userId: payload.userId });

                return Result.fail(new UnauthorizedError('Refresh token expired'));
            }

            // Generate new access token
            const accessToken = generateAccessToken(payload.userId);

            logger.debug('Access token refreshed', { userId: payload.userId });

            return Result.ok({ accessToken });
        } catch (error) {
            logger.error('Error refreshing token', { error });

            return Result.fail(new UnauthorizedError('Failed to refresh token'));
        }
    }

    /**
     * Logout user (invalidate refresh token)
     */
    async logout(userId: string, refreshToken: string): Promise<void> {
        try {
            await prisma.refreshToken.deleteMany({
                where: {
                    userId,
                    token: refreshToken
                }
            });

            logger.info('User logged out', { userId });
        } catch (error) {
            logger.error('Error during logout', { error: userId });
            // Do not use throw - lgout should always succeed
        }
    }

    /**
     * Store refresh token in database
     */
    private async storeRefreshToken(userId: string, token: string): Promise<void> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

        await prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt
            }
        });

        logger.debug('Refresh token stored', { userId });
    }
}
