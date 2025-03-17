/**
 * Cache Plugin
 * Simple caching plugin for Elysia routes
 */
import { Elysia } from 'elysia';
import type { ServiceCacheConfig } from '../config/cache.redis.config';
import { getCacheConfig } from '../config/cache.redis.config';
import { cacheRedis } from '../redis';

type CacheContext = {
    cacheKey: string;
    config: ServiceCacheConfig;
};

/**
 * Cache plugin for Elysia routes
 * Provides automatic caching for route responses
 */
export const cache = new Elysia({ name: 'cache' })
    .derive(({ request }): CacheContext => {
        const config = getCacheConfig(request.url);
        const path = new URL(request.url).pathname;
        const cacheKey = `${config.service}:route:${path}`;
        return { cacheKey, config };
    })
    .onBeforeHandle(async ({ cacheKey }: CacheContext) => {
        try {
            const cachedData = await cacheRedis.getJson(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        } catch (error) {
            console.error('Cache read error:', error);
        }
    })
    .onAfterHandle(async (context) => {
        const { cacheKey, config } = context as CacheContext;
        const response = context.response;

        if (response) {
            try {
                await cacheRedis.setJson(cacheKey, response, config.ttl);
            } catch (error) {
                console.error('Cache write error:', error);
            }
        }
        return response;
    });
