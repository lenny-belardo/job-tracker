import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

/**
 * Hash a plain text password
 */
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain text password with hashed password
 */
export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};
