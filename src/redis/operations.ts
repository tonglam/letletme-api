import type Redis from 'ioredis';
import { REDIS_CONFIG, type RedisClientType } from '../config/app.config';
import { logger } from '../config/logger.config';

/**
 * Type definition for Redis operations
 */
export type RedisOperations = {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    getJson<T>(key: string): Promise<T | null>;
    setJson<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    hget(key: string, field: string): Promise<string | null>;
    hset(key: string, field: string, value: string): Promise<void>;
    hdel(key: string, field: string): Promise<void>;
    hgetall(key: string): Promise<Record<string, string>>;
    expire(key: string, ttl: number): Promise<void>;
    ttl(key: string): Promise<number>;
    ping(): Promise<string>;
    smembers(key: string): Promise<string[]>;
    scan(pattern: string): Promise<string[]>;
};

/**
 * Error thrown when attempting write operations on data Redis
 */
const writeError = new Error(
    'Write operations are not allowed on data Redis client',
);

/**
 * Create Redis operations with write safety checks
 * @param getClient Function to get Redis client
 * @param clientType Type of Redis client ('cache' or 'data')
 */
export const createRedisOperations = (
    getClient: () => Redis,
    clientType: RedisClientType,
): RedisOperations => ({
    // Get a value from Redis
    async get(key: string): Promise<string | null> {
        return getClient().get(key);
    },

    // Set a value in Redis with optional TTL
    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (clientType === REDIS_CONFIG.CLIENT_TYPES.DATA) throw writeError;
        if (ttl) {
            await getClient().set(key, value, 'EX', ttl);
        } else {
            await getClient().set(key, value);
        }
    },

    // Get a JSON value from Redis
    async getJson<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (!value) {
            return null;
        }

        try {
            return JSON.parse(value) as T;
        } catch (err) {
            logger.error({ err, key }, 'Error parsing JSON from Redis key');
            return null;
        }
    },

    // Set a JSON value in Redis with optional TTL
    async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
        if (clientType === REDIS_CONFIG.CLIENT_TYPES.DATA) throw writeError;
        await this.set(key, JSON.stringify(value), ttl);
    },

    // Delete a key from Redis
    async del(key: string): Promise<void> {
        if (clientType === REDIS_CONFIG.CLIENT_TYPES.DATA) throw writeError;
        await getClient().del(key);
    },

    // Hash operations
    async hget(key: string, field: string): Promise<string | null> {
        return getClient().hget(key, field);
    },

    async hset(key: string, field: string, value: string): Promise<void> {
        if (clientType === REDIS_CONFIG.CLIENT_TYPES.DATA) throw writeError;
        await getClient().hset(key, field, value);
    },

    async hdel(key: string, field: string): Promise<void> {
        if (clientType === REDIS_CONFIG.CLIENT_TYPES.DATA) throw writeError;
        await getClient().hdel(key, field);
    },

    async hgetall(key: string): Promise<Record<string, string>> {
        return getClient().hgetall(key);
    },

    async expire(key: string, ttl: number): Promise<void> {
        if (clientType === REDIS_CONFIG.CLIENT_TYPES.DATA) throw writeError;
        await getClient().expire(key, ttl);
    },

    async ttl(key: string): Promise<number> {
        return getClient().ttl(key);
    },

    // Ping to check connection
    async ping(): Promise<string> {
        return getClient().ping();
    },

    // Set operations
    async smembers(key: string): Promise<string[]> {
        return getClient().smembers(key);
    },

    // Scan operation with pattern matching
    async scan(pattern: string): Promise<string[]> {
        const client = getClient();
        const stream = client.scanStream({
            match: pattern,
            count: 100,
        });

        const keys: string[] = [];
        for await (const resultKeys of stream) {
            keys.push(...resultKeys);
        }
        return keys;
    },
});
