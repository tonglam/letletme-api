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
        // Log Redis configuration
        logger.info(
            {
                host: redisCacheConfig.host,
                port: redisCacheConfig.port,
                db: redisCacheConfig.db,
                hasPassword: !!redisCacheConfig.password,
                password: redisCacheConfig.password,
            },
            'Cache Redis configuration',
        );

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
            retryStrategy: (times): number => {
                logger.info({ times }, 'Cache Redis retry attempt');
                return Math.min(times * 100, 3000); // Maximum 3 seconds delay
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            showFriendlyErrorStack: true,
        });

        // Setup event listeners
        client.on('error', (err) => {
            logger.error({ err }, 'Cache Redis error');
        });

        client.on('connect', () => {
            logger.info(
                {
                    host: redisCacheConfig.host,
                    port: redisCacheConfig.port,
                    db: redisCacheConfig.db,
                },
                'Connected to Cache Redis server',
            );
        });

        client.on('ready', () => {
            logger.info('Cache Redis client is ready');
        });

        client.on('reconnecting', () => {
            logger.info('Cache Redis client is reconnecting');
        });

        client.on('end', () => {
            logger.info('Cache Redis connection ended');
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
