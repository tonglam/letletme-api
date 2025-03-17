/**
 * Redis Module
 *
 * This module exports two Redis clients:
 * - dataRedis: Read-only client for accessing application data
 * - cacheRedis: Read/write client for caching operations
 *
 * Both clients share the same Redis operations interface defined in operations.ts
 */

export { cacheRedis } from './cache.client';
export { dataRedis } from './data.client';
export type { RedisOperations } from './operations';
