import 'dotenv/config';

/**
 * Configuration for the read-only data Redis instance
 */
export const dataRedisConfig = {
    host: process.env.DATA_REDIS_HOST || 'localhost',
    port: parseInt(process.env.DATA_REDIS_PORT || '6379', 10),
    password: process.env.DATA_REDIS_PASSWORD || undefined,
    db: parseInt(process.env.DATA_REDIS_DB || '0', 10),
} as const;
