import Redis from 'ioredis';
import { REDIS_CONFIG } from '../config/app.config';
import { dataRedisConfig } from '../config/data.redis.config';
import { logger } from '../config/logger.config';
import type { RedisOperations } from './operations';
import { createRedisOperations } from './operations';

// Create Redis client for data
let client: Redis | null = null;

const getClient = (): Redis => {
    if (!client) {
        client = new Redis({
            host: dataRedisConfig.host,
            port: dataRedisConfig.port,
            password: dataRedisConfig.password,
            db: dataRedisConfig.db,
            // Reconnect strategy
            reconnectOnError: (err): boolean => {
                logger.error({ err }, 'Data Redis connection error');
                return true; // Auto-reconnect
            },
        });

        // Setup event listeners
        client.on('error', (err) => {
            logger.error({ err }, 'Data Redis error');
        });

        client.on('connect', () => {
            logger.info('Connected to Data Redis server');
        });
    }
    return client;
};

// Create Redis operations with the data client
const operations = createRedisOperations(
    getClient,
    REDIS_CONFIG.CLIENT_TYPES.DATA,
);

// Export data Redis client with operations and close method
export const dataRedis: RedisOperations & {
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
