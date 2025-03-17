/**
 * Cache Configuration
 * Simple TTL configuration for service-level caching
 */
import { ServiceName } from '../utils/redis-key.utils';

/**
 * Cache configuration interface
 */
export interface ServiceCacheConfig {
    ttl: number;
    service: ServiceName;
}

/**
 * Service-level TTL rules
 */
export type ServiceTTLRules = Partial<Record<ServiceName, number>>;

/**
 * Service-specific TTL configurations (in seconds)
 */
export const serviceTTLRules: ServiceTTLRules = {
    [ServiceName.EVENT]: 60, // 1 minute
    [ServiceName.FIXTURE]: 300, // 5 minutes
    [ServiceName.TEAM]: 86400, // 24 hours
    [ServiceName.PLAYER]: 3600, // 1 hour
    [ServiceName.LEAGUE]: 3600, // 1 hour
    [ServiceName.ENTRY]: 300, // 5 minutes
    [ServiceName.SUMMARY]: 300, // 5 minutes
};

/**
 * Default cache configuration
 */
export const cacheConfig = {
    defaultTtl: 3600, // 1 hour
} as const;

/**
 * Get cache configuration for a specific path
 * @param path API path (e.g., /v1/events/current-with-deadline)
 */
export const getCacheConfig = (path: string): ServiceCacheConfig => {
    // Extract service from path
    const [, , service] = path.split('/');
    const serviceName = service.toUpperCase() as keyof typeof ServiceName;
    const serviceType = ServiceName[serviceName] ?? ServiceName.SYSTEM;

    return {
        ttl: serviceTTLRules[serviceType] ?? cacheConfig.defaultTtl,
        service: serviceType,
    };
};
