import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3000'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().default('7d'),
    BCRYPT_ROUNDS: z.string().transform(Number).default('10'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
    ALLOWED_ORIGINS: z.string().default('http://lcoalhost:5173')
});

export type Environment = z.infer<typeof envSchema>;

export const env: Environment = envSchema.parse(process.env);

export default env;
