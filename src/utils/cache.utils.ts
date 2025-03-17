/**
 * Service-level cache utilities
 * Provides function-level caching capabilities using Redis
 */
import { getCacheConfig } from '../config/cache.redis.config';
import { logger } from '../config/logger.config';
import { cacheRedis } from '../redis';
import {
    CacheNamespace,
    eventCacheKeys,
    fixtureCacheKeys,
} from './cache-key.utils';
import { ServiceName } from './redis-key.utils';

/**
 * Get data from cache for a service endpoint
 */
export const getFromCache = async <T>(
    serviceName: ServiceName,
    endpoint: string,
): Promise<T | null> => {
    try {
        const config = getCacheConfig(`/v1/${serviceName}/${endpoint}`);
        const cacheKey = getCacheKeyForService(serviceName, endpoint);
        logger.info(
            { cacheKey, endpoint, serviceName, config },
            'Attempting to get from cache',
        );

        const data = await cacheRedis.get(cacheKey);
        logger.info(
            { cacheKey, endpoint, hasData: !!data, data },
            'Cache get result',
        );

        if (!data) {
            return null;
        }

        try {
            const parsed = JSON.parse(data) as T;
            logger.info(
                { cacheKey, endpoint, parsed },
                'Successfully parsed cached data',
            );
            return parsed;
        } catch (err) {
            // If data can't be parsed, remove it from cache
            logger.error(
                { err, cacheKey, endpoint },
                'Failed to parse cached data',
            );
            await cacheRedis.del(cacheKey);
            return null;
        }
    } catch (err) {
        logger.error({ err, serviceName, endpoint }, 'Cache read error');
        return null;
    }
};

/**
 * Set data to cache for a service endpoint
 */
export const setToCache = async <T>(
    serviceName: ServiceName,
    endpoint: string,
    data: T,
    ttl?: number,
): Promise<void> => {
    try {
        const config = getCacheConfig(`/v1/${serviceName}/${endpoint}`);
        const cacheKey = getCacheKeyForService(serviceName, endpoint);
        const serializedData = JSON.stringify(data);

        logger.info(
            { cacheKey, endpoint, ttl: ttl || config.ttl, data },
            'Setting data to cache',
        );

        // Store the data with TTL
        const finalTtl = ttl || config.ttl;
        if (finalTtl > 0) {
            await cacheRedis.set(cacheKey, serializedData, finalTtl);
        } else {
            await cacheRedis.set(cacheKey, serializedData);
        }
    } catch (err) {
        logger.error({ err, serviceName, endpoint }, 'Cache write error');
    }
};

/**
 * Delete data from cache for a service endpoint
 */
export const deleteFromCache = async (
    serviceName: ServiceName,
    endpoint: string,
): Promise<void> => {
    try {
        const cacheKey = getCacheKeyForService(serviceName, endpoint);
        await cacheRedis.del(cacheKey);
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
        const pattern = `api:${getNamespaceForService(serviceName)}:*`;
        const keys = await cacheRedis.scan(pattern);

        for (const key of keys) {
            await cacheRedis.del(key);
        }
    } catch (err) {
        logger.error({ err, serviceName }, 'Cache clear error');
    }
};

/**
 * Get the appropriate cache key for a service and endpoint
 */
const getCacheKeyForService = (
    serviceName: ServiceName,
    endpoint: string,
): string => {
    switch (serviceName) {
        case ServiceName.EVENT:
            if (endpoint === 'current-with-deadline') {
                return eventCacheKeys.currentWithDeadline();
            }
            // Add more event endpoints as needed
            break;
        case ServiceName.EVENT_FIXTURE:
            if (endpoint === 'next-gameweek') {
                return fixtureCacheKeys.nextGameweek();
            }
            // Add more fixture endpoints as needed
            break;
        // Add more services as needed
    }
    // Fallback to a generic cache key if no specific mapping exists
    return `api:${getNamespaceForService(serviceName)}:${endpoint}`;
};

/**
 * Get the cache namespace for a service
 */
const getNamespaceForService = (serviceName: ServiceName): CacheNamespace => {
    switch (serviceName) {
        case ServiceName.EVENT:
            return CacheNamespace.EVENT;
        case ServiceName.EVENT_FIXTURE:
            return CacheNamespace.FIXTURE;
        case ServiceName.TEAM:
            return CacheNamespace.TEAM;
        case ServiceName.PLAYER:
            return CacheNamespace.PLAYER;
        case ServiceName.STANDING:
            return CacheNamespace.LEAGUE;
        case ServiceName.PLAYER_VALUE:
            return CacheNamespace.ENTRY;
        case ServiceName.EVENT_OVERALL_RESULT:
            return CacheNamespace.SUMMARY;
        default:
            return CacheNamespace.EVENT;
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
            logger.info({ serviceName, endpoint }, 'Checking cache');
            const cachedData = await getFromCache<T>(serviceName, endpoint);
            if (cachedData !== null) {
                logger.info({ serviceName, endpoint, cachedData }, 'Cache hit');
                return cachedData;
            }
            logger.info({ serviceName, endpoint }, 'Cache miss');
        } catch (err) {
            logger.error({ err, serviceName, endpoint }, 'Cache read error');
            // Let the error propagate by continuing to the original function
        }

        // Execute the original function
        const result = await fn();

        // Try to cache the result if available
        if (result !== null && result !== undefined) {
            try {
                logger.info(
                    { serviceName, endpoint, result },
                    'Caching result',
                );
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
