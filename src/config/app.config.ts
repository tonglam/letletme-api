/**
 * Global application configuration
 */

/**
 * Premier League configuration
 */
export const SEASON_CONFIG = {
    SEASON: {
        START_MONTH: 8, // Premier League season starts in August
        TOTAL_GAMEWEEKS: 38, // Premier League has 38 gameweeks
    },
} as const;

/**
 * Redis client types
 */
export const REDIS_CONFIG = {
    CLIENT_TYPES: {
        CACHE: 'cache',
        DATA: 'data',
    },
} as const;

export type RedisClientType =
    (typeof REDIS_CONFIG.CLIENT_TYPES)[keyof typeof REDIS_CONFIG.CLIENT_TYPES];
