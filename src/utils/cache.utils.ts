/**
 * Service-level cache utilities
 * Provides function-level caching capabilities using Redis hashes
 */
import { getCacheConfig } from '../config/cache.config';
import { redis } from '../redis';

/**
 * Get data from cache hash for a service endpoint
 */
export const getFromCache = async <T>(
    serviceName: string,
    endpoint: string,
): Promise<T | null> => {
    try {
        const config = getCacheConfig(`/v1/${serviceName}/${endpoint}`);
        const hashKey = `cache:${config.service}`;
        const data = await redis.getClient().hget(hashKey, endpoint);

        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data) as T;
        } catch {
            // If data can't be parsed, remove it from cache
            await redis.getClient().hdel(hashKey, endpoint);
            return null;
        }
    } catch (error) {
        console.error('Cache read error:', error);
        return null;
    }
};

/**
 * Set data to cache hash for a service endpoint
 */
export const setToCache = async <T>(
    serviceName: string,
    endpoint: string,
    data: T,
    ttl?: number,
): Promise<void> => {
    try {
        const config = getCacheConfig(`/v1/${serviceName}/${endpoint}`);
        const hashKey = `cache:${config.service}`;
        const serializedData = JSON.stringify(data);
        const client = redis.getClient();

        // Store the data in the hash
        await client.hset(hashKey, endpoint, serializedData);

        // Set TTL on the entire hash if not already set
        const ttlExists = await client.ttl(hashKey);
        if (ttlExists === -1) {
            // -1 means no TTL set
            await client.expire(hashKey, ttl || config.ttl);
        }
    } catch (error) {
        console.error('Cache write error:', error);
    }
};

/**
 * Delete data from cache hash for a service endpoint
 */
export const deleteFromCache = async (
    serviceName: string,
    endpoint: string,
): Promise<void> => {
    try {
        const config = getCacheConfig(`/v1/${serviceName}/${endpoint}`);
        const hashKey = `cache:${config.service}`;
        await redis.getClient().hdel(hashKey, endpoint);
    } catch (error) {
        console.error('Cache delete error:', error);
    }
};

/**
 * Delete all cached data for a service
 */
export const clearServiceCache = async (serviceName: string): Promise<void> => {
    try {
        const config = getCacheConfig(`/v1/${serviceName}/`);
        const hashKey = `cache:${config.service}`;
        await redis.getClient().del(hashKey);
    } catch (error) {
        console.error('Cache clear error:', error);
    }
};

/**
 * Create a cached version of a function
 * Uses service configuration for caching behavior
 *
 * @param serviceName Name of the service (e.g., 'fixtures')
 * @param endpoint Endpoint identifier (e.g., 'next-gameweek')
 * @param fn Function to cache
 * @param ttl Optional TTL override
 */
export const createCachedFunction = <T>(
    serviceName: string,
    endpoint: string,
    fn: () => Promise<T>,
    ttl?: number,
): (() => Promise<T>) => {
    return async () => {
        const cachedData = await getFromCache<T>(serviceName, endpoint);
        if (cachedData !== null) {
            return cachedData;
        }

        const result = await fn();
        if (result !== null && result !== undefined) {
            await setToCache(serviceName, endpoint, result, ttl);
        }

        return result;
    };
};
