/**
 * Cache Configuration
 * Simple TTL configuration for service-level caching
 */
import { ServiceName } from '../utils/redis-key.utils';

/**
 * Redis cache configuration interface
 */
export interface RedisCacheConfig {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
}

/**
 * Redis cache configuration
 */
export const redisCacheConfig: RedisCacheConfig = {
    host: process.env.CACHE_REDIS_HOST || 'localhost',
    port: parseInt(process.env.CACHE_REDIS_PORT || '6379', 10),
    password: process.env.CACHE_REDIS_PASSWORD || undefined,
    db: parseInt(process.env.CACHE_REDIS_DB || '0', 10),
};

/**
 * Cache service names for TTL rules
 */
export enum CacheServiceName {
    EVENT = 'event',
    FIXTURE = 'fixture',
    TEAM = 'team',
    PLAYER = 'player',
    LEAGUE = 'league',
    ENTRY = 'entry',
    SUMMARY = 'summary',
}

/**
 * TTL rules for different services in seconds
 */
export type ServiceTTLRules = Record<CacheServiceName, number>;

/**
 * Service-specific TTL configurations (in seconds)
 */
export const serviceTTLRules: ServiceTTLRules = {
    [CacheServiceName.EVENT]: 60, // 1 minute
    [CacheServiceName.FIXTURE]: 300, // 5 minutes
    [CacheServiceName.TEAM]: 86400, // 24 hours
    [CacheServiceName.PLAYER]: 3600, // 1 hour
    [CacheServiceName.LEAGUE]: 3600, // 1 hour
    [CacheServiceName.ENTRY]: 300, // 5 minutes
    [CacheServiceName.SUMMARY]: 300, // 5 minutes
};

/**
 * Cache configuration interface
 */
export interface CacheConfig {
    ttl: number;
    service: ServiceName;
}

/**
 * Map service path to cache configuration
 */
const cacheConfigMap = new Map<string, CacheConfig>();

/**
 * Get cache configuration for a service path
 */
export const getCacheConfig = (path: string): CacheConfig => {
    const config = cacheConfigMap.get(path);
    if (config) {
        return config;
    }

    // Extract service name from path
    const [, service] = path.split('/');
    if (!service) {
        return { ttl: 0, service: ServiceName.EVENT };
    }

    // Map cache service name to ServiceName
    const cacheServiceMap: Record<CacheServiceName, ServiceName> = {
        [CacheServiceName.EVENT]: ServiceName.EVENT,
        [CacheServiceName.FIXTURE]: ServiceName.EVENT_FIXTURE,
        [CacheServiceName.TEAM]: ServiceName.TEAM,
        [CacheServiceName.PLAYER]: ServiceName.PLAYER,
        [CacheServiceName.LEAGUE]: ServiceName.STANDING,
        [CacheServiceName.ENTRY]: ServiceName.PLAYER_VALUE,
        [CacheServiceName.SUMMARY]: ServiceName.EVENT_OVERALL_RESULT,
    };

    // Get TTL from rules
    const ttl = serviceTTLRules[service as CacheServiceName] || 0;
    const mappedService =
        cacheServiceMap[service as CacheServiceName] || ServiceName.EVENT;

    const newConfig: CacheConfig = {
        ttl,
        service: mappedService,
    };

    cacheConfigMap.set(path, newConfig);
    return newConfig;
};
