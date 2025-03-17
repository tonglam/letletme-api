/**
 * Service-level cache utilities
 * Provides function-level caching capabilities using Redis hashes
 */
import { getCacheConfig } from '../config/cache.redis.config';
import { logger } from '../config/logger.config';
import { cacheRedis } from '../redis';
import type { ServiceName } from './redis-key.utils';

/**
 * Generate a cache hash key for a service
 */
const generateHashKey = (service: ServiceName): string => `cache:${service}`;

/**
 * Get data from cache hash for a service endpoint
 */
export const getFromCache = async <T>(
    serviceName: ServiceName,
    endpoint: string,
): Promise<T | null> => {
    try {
        const config = getCacheConfig(`/v1/${serviceName}/${endpoint}`);
        const hashKey = generateHashKey(config.service);
        const data = await cacheRedis.hget(hashKey, endpoint);

        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data) as T;
        } catch (err) {
            // If data can't be parsed, remove it from cache
            logger.error(
                { err, hashKey, endpoint },
                'Failed to parse cached data',
            );
            await cacheRedis.hdel(hashKey, endpoint);
            return null;
        }
    } catch (err) {
        logger.error({ err, serviceName, endpoint }, 'Cache read error');
        return null;
    }
};

/**
 * Set data to cache hash for a service endpoint
 */
export const setToCache = async <T>(
    serviceName: ServiceName,
    endpoint: string,
    data: T,
    ttl?: number,
): Promise<void> => {
    try {
        const config = getCacheConfig(`/v1/${serviceName}/${endpoint}`);
        const hashKey = generateHashKey(config.service);
        const serializedData = JSON.stringify(data);

        // Store the data in the hash
        await cacheRedis.hset(hashKey, endpoint, serializedData);

        // Set TTL on the entire hash if not already set
        const ttlExists = await cacheRedis.ttl(hashKey);
        if (ttlExists === -1) {
            // -1 means no TTL set
            await cacheRedis.expire(hashKey, ttl || config.ttl);
        }
    } catch (err) {
        logger.error({ err, serviceName, endpoint }, 'Cache write error');
    }
};

/**
 * Delete data from cache hash for a service endpoint
 */
export const deleteFromCache = async (
    serviceName: ServiceName,
    endpoint: string,
): Promise<void> => {
    try {
        const config = getCacheConfig(`/v1/${serviceName}/${endpoint}`);
        const hashKey = generateHashKey(config.service);
        await cacheRedis.hdel(hashKey, endpoint);
    } catch (err) {
        logger.error({ err, serviceName, endpoint }, 'Cache delete error');
    }
};

/**
 * Delete all cached data for a service
 */
export const clearServiceCache = async (
    serviceName: ServiceName,
): Promise<void> => {
    try {
        const config = getCacheConfig(`/v1/${serviceName}/`);
        const hashKey = generateHashKey(config.service);
        await cacheRedis.del(hashKey);
    } catch (err) {
        logger.error({ err, serviceName }, 'Cache clear error');
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
    serviceName: ServiceName,
    endpoint: string,
    fn: () => Promise<T>,
    ttl?: number,
): (() => Promise<T>) => {
    return async () => {
        try {
            const cachedData = await getFromCache<T>(serviceName, endpoint);
            if (cachedData !== null) {
                return cachedData;
            }
        } catch (err) {
            logger.error({ err, serviceName, endpoint }, 'Cache read error');
            // Let the error propagate by continuing to the original function
        }

        // Execute the original function
        const result = await fn();

        // Try to cache the result if available
        if (result !== null && result !== undefined) {
            try {
                await setToCache(serviceName, endpoint, result, ttl);
            } catch (err) {
                logger.error(
                    { err, serviceName, endpoint },
                    'Cache write error',
                );
                // Let the error propagate by continuing
            }
        }

        return result;
    };
};
