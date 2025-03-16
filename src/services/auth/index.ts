import { hash, verify } from '@node-rs/argon2';
import { randomBytes } from 'crypto';
import { redis } from '../../redis';

// Constants
const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds
const CSRF_TOKEN_LENGTH = 32;

// Types
export interface User {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
}

export interface Session {
    userId: number;
    username: string;
    csrfToken: string;
    createdAt: number;
}

/**
 * Generate a secure random token
 */
export function generateToken(length = CSRF_TOKEN_LENGTH): string {
    return randomBytes(length).toString('hex');
}

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
    return hash(password, {
        memoryCost: 65536, // 64MB
        timeCost: 3, // 3 iterations
        parallelism: 1,
    });
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
    password: string,
    hash: string,
): Promise<boolean> {
    return verify(hash, password);
}

/**
 * Create a new session for a user
 */
export async function createSession(user: User): Promise<Session> {
    const sessionId = generateToken();
    const csrfToken = generateToken();
    const now = Math.floor(Date.now() / 1000);

    const session: Session = {
        userId: user.id,
        username: user.username,
        csrfToken,
        createdAt: now,
    };

    // Store session in Redis
    await redis.setJson(`session:${sessionId}`, session, SESSION_EXPIRY);

    return session;
}

/**
 * Get a session by ID
 */
export async function getSession(sessionId: string): Promise<Session | null> {
    return await redis.getJson<Session>(`session:${sessionId}`);
}

/**
 * Validate a CSRF token against a session
 */
export function validateCsrfToken(session: Session, token: string): boolean {
    return session.csrfToken === token;
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
}
