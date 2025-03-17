import Redis from 'ioredis';
import { REDIS_CONFIG } from '../config/app.config';
import { redisCacheConfig } from '../config/cache.redis.config';
import { logger } from '../config/logger.config';
import type { RedisOperations } from './operations';
import { createRedisOperations } from './operations';

// Create Redis client for caching
let client: Redis | null = null;

const getClient = (): Redis => {
    if (!client) {
        client = new Redis({
            host: redisCacheConfig.host,
            port: redisCacheConfig.port,
            password: redisCacheConfig.password,
            db: redisCacheConfig.db,
            // Reconnect strategy
            reconnectOnError: (err): boolean => {
                logger.error({ err }, 'Cache Redis connection error');
                return true; // Auto-reconnect
            },
        });

        // Setup event listeners
        client.on('error', (err) => {
            logger.error({ err }, 'Cache Redis error');
        });

        client.on('connect', () => {
            logger.info('Connected to Cache Redis server');
        });
    }
    return client;
};

// Create Redis operations with the cache client
const operations = createRedisOperations(
    getClient,
    REDIS_CONFIG.CLIENT_TYPES.CACHE,
);

// Export cache Redis client with operations and close method
export const cacheRedis: RedisOperations & {
    close(): Promise<void>;
} = {
    ...operations,

    // Close Redis connection
    async close(): Promise<void> {
        if (client) {
            await client.quit();
            client = null;
        }
    },
};
