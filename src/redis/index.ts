import Redis from 'ioredis';
import { logger } from '../config/logger.config';
import { redisConfig } from '../config/redis.config';

// Create Redis client instance
const client = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    db: redisConfig.db,
    // Reconnect strategy
    reconnectOnError: (err): boolean => {
        logger.error({ err }, 'Redis connection error');
        return true; // Auto-reconnect
    },
});

// Setup event listeners
client.on('error', (err) => {
    logger.error({ err }, 'Redis error');
});

client.on('connect', () => {
    logger.info('Connected to Redis server');
});

/**
 * Get the underlying Redis client
 */
export function getClient(): Redis {
    return client;
}

/**
 * Set a value in Redis with an optional expiration time
 */
export async function set(
    key: string,
    value: string,
    ttl?: number,
): Promise<void> {
    if (ttl) {
        await client.set(key, value, 'EX', ttl);
    } else {
        await client.set(key, value);
    }
}

/**
 * Get a value from Redis
 */
export async function get(key: string): Promise<string | null> {
    return client.get(key);
}

/**
 * Delete a key from Redis
 */
export async function del(key: string): Promise<void> {
    await client.del(key);
}

/**
 * Check if a key exists in Redis
 */
export async function exists(key: string): Promise<boolean> {
    const result = await client.exists(key);
    return result === 1;
}

/**
 * Set a value in Redis with an expiration time
 */
export async function setEx(
    key: string,
    ttl: number,
    value: string,
): Promise<void> {
    await client.setex(key, ttl, value);
}

/**
 * Set a JSON value in Redis
 */
export async function setJson<T>(
    key: string,
    value: T,
    ttl?: number,
): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await set(key, jsonValue, ttl);
}

/**
 * Get a JSON value from Redis
 */
export async function getJson<T>(key: string): Promise<T | null> {
    const value = await get(key);
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch (err) {
        logger.error({ err, key }, 'Error parsing JSON from Redis key');
        return null;
    }
}

/**
 * Set multiple keys at once
 */
export async function mSet(keyValues: Record<string, string>): Promise<void> {
    const args: string[] = [];
    for (const [key, value] of Object.entries(keyValues)) {
        args.push(key, value);
    }
    await client.mset(args);
}

/**
 * Get multiple keys at once
 */
export async function mGet(keys: string[]): Promise<(string | null)[]> {
    return client.mget(keys);
}

/**
 * Close the Redis connection
 */
export async function close(): Promise<void> {
    await client.quit();
}

// Export a single object with all Redis operations
export const redis = {
    getClient,
    set,
    get,
    del,
    exists,
    setEx,
    setJson,
    getJson,
    mSet,
    mGet,
    close,
};
