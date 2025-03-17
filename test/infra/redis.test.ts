import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { dataRedis } from '../../src/redis';
import type { RedisOperations } from '../../src/redis/operations';

// Test key prefix to avoid conflicts with actual application data
const TEST_KEY_PREFIX = 'test:redis:';

// Test data constants
const TEST_STRING_KEY = `${TEST_KEY_PREFIX}string`;
const TEST_STRING_VALUE = 'test-value';
const TEST_JSON_KEY = `${TEST_KEY_PREFIX}json`;
const TEST_JSON_VALUE = { name: 'test', value: 123 };
const TEST_HASH_KEY = `${TEST_KEY_PREFIX}hash`;
const TEST_HASH_FIELD = 'field';
const TEST_HASH_VALUE = 'hash-value';
const TEST_MULTI_KEYS = [
    `${TEST_KEY_PREFIX}multi:1`,
    `${TEST_KEY_PREFIX}multi:2`,
];
const TEST_MULTI_VALUES = ['multi-value-1', 'multi-value-2'];

describe('Redis Operations', () => {
    let redis: RedisOperations & { close(): Promise<void> };

    // Setup before all tests
    beforeAll(async () => {
        redis = dataRedis;

        // Set up test data
        await redis.set(TEST_STRING_KEY, TEST_STRING_VALUE);
        await redis.setJson(TEST_JSON_KEY, TEST_JSON_VALUE);
        await redis.hset(TEST_HASH_KEY, TEST_HASH_FIELD, TEST_HASH_VALUE);
        await Promise.all(
            TEST_MULTI_KEYS.map((key, index) =>
                redis.set(key, TEST_MULTI_VALUES[index]),
            ),
        );
    });

    // Cleanup after all tests
    afterAll(async () => {
        // Clean up test data
        await Promise.all([
            redis.del(TEST_STRING_KEY),
            redis.del(TEST_JSON_KEY),
            redis.del(TEST_HASH_KEY),
            ...TEST_MULTI_KEYS.map((key) => redis.del(key)),
        ]);

        // Close Redis connection
        await redis.close();
    });

    describe('Basic Operations', () => {
        it('should connect and ping Redis server', async () => {
            const result = await redis.ping();
            expect(result).toBe('PONG');
        });

        it('should set and get string value', async () => {
            const key = `${TEST_KEY_PREFIX}set-get`;
            const value = 'test-set-get';

            await redis.set(key, value);
            const result = await redis.get(key);

            expect(result).toBe(value);
            await redis.del(key);
        });

        it('should return null for non-existent key', async () => {
            const key = `${TEST_KEY_PREFIX}non-existent`;
            const value = await redis.get(key);
            expect(value).toBeNull();
        });

        it('should read an existing string value', async () => {
            const value = await redis.get(TEST_STRING_KEY);
            expect(value).toBe(TEST_STRING_VALUE);
        });

        it('should delete existing key', async () => {
            const key = `${TEST_KEY_PREFIX}to-delete`;
            await redis.set(key, 'delete-me');

            await redis.del(key);
            const value = await redis.get(key);

            expect(value).toBeNull();
        });
    });

    describe('JSON Operations', () => {
        it('should set and get JSON value', async () => {
            const key = `${TEST_KEY_PREFIX}json-set-get`;
            const value = { test: 'value', number: 123 };

            await redis.setJson(key, value);
            const result = await redis.getJson(key);

            expect(result).toEqual(value);
            await redis.del(key);
        });

        it('should return null for non-existent JSON key', async () => {
            const key = `${TEST_KEY_PREFIX}non-existent-json`;
            const value = await redis.getJson(key);
            expect(value).toBeNull();
        });

        it('should read an existing JSON value', async () => {
            const value = await redis.getJson(TEST_JSON_KEY);
            expect(value).toEqual(TEST_JSON_VALUE);
        });

        it('should handle invalid JSON data gracefully', async () => {
            const invalidJsonKey = `${TEST_KEY_PREFIX}invalid-json`;
            await redis.set(invalidJsonKey, 'invalid-json');

            const value = await redis.getJson(invalidJsonKey);
            expect(value).toBeNull();

            await redis.del(invalidJsonKey);
        });
    });

    describe('Hash Operations', () => {
        it('should set and get hash field value', async () => {
            const key = `${TEST_KEY_PREFIX}hash-set-get`;
            const field = 'test-field';
            const value = 'test-value';

            await redis.hset(key, field, value);
            const result = await redis.hget(key, field);

            expect(result).toBe(value);
            await redis.del(key);
        });

        it('should read hash field value', async () => {
            const value = await redis.hget(TEST_HASH_KEY, TEST_HASH_FIELD);
            expect(value).toBe(TEST_HASH_VALUE);
        });

        it('should return null for non-existent hash field', async () => {
            const value = await redis.hget(TEST_HASH_KEY, 'non-existent-field');
            expect(value).toBeNull();
        });

        it('should get all hash fields', async () => {
            const values = await redis.hgetall(TEST_HASH_KEY);
            expect(values).toEqual({ [TEST_HASH_FIELD]: TEST_HASH_VALUE });
        });

        it('should delete hash field', async () => {
            const key = `${TEST_KEY_PREFIX}hash-del`;
            const field = 'to-delete';
            await redis.hset(key, field, 'delete-me');

            await redis.hdel(key, field);
            const value = await redis.hget(key, field);

            expect(value).toBeNull();
            await redis.del(key);
        });
    });

    describe('Multi-Key Operations', () => {
        it('should read multiple values sequentially', async () => {
            const values = await Promise.all(
                TEST_MULTI_KEYS.map((key) => redis.get(key)),
            );
            expect(values).toEqual(TEST_MULTI_VALUES);
        });

        it('should return nulls for non-existent keys', async () => {
            const nonExistentKeys = [
                `${TEST_KEY_PREFIX}non-existent-1`,
                `${TEST_KEY_PREFIX}non-existent-2`,
            ];
            const values = await Promise.all(
                nonExistentKeys.map((key) => redis.get(key)),
            );
            expect(values).toEqual([null, null]);
        });
    });

    describe('TTL Operations', () => {
        it('should set and get TTL', async () => {
            const ttlKey = `${TEST_KEY_PREFIX}ttl`;
            const ttlValue = 'ttl-test';
            const ttlSeconds = 60;

            await redis.set(ttlKey, ttlValue, ttlSeconds);
            const remainingTtl = await redis.ttl(ttlKey);

            expect(remainingTtl).toBeGreaterThan(0);
            expect(remainingTtl).toBeLessThanOrEqual(ttlSeconds);

            await redis.del(ttlKey);
        });

        it('should set TTL on existing key', async () => {
            const key = `${TEST_KEY_PREFIX}expire`;
            const ttlSeconds = 30;

            await redis.set(key, 'expire-test');
            await redis.expire(key, ttlSeconds);
            const remainingTtl = await redis.ttl(key);

            expect(remainingTtl).toBeGreaterThan(0);
            expect(remainingTtl).toBeLessThanOrEqual(ttlSeconds);

            await redis.del(key);
        });

        it('should return -1 for key without TTL', async () => {
            const ttl = await redis.ttl(TEST_STRING_KEY);
            expect(ttl).toBe(-1);
        });

        it('should return -2 for non-existent key TTL', async () => {
            const ttl = await redis.ttl(`${TEST_KEY_PREFIX}non-existent`);
            expect(ttl).toBe(-2);
        });
    });

    describe('Error Handling', () => {
        it('should handle connection errors gracefully', async () => {
            // This test assumes the Redis server is running
            // In a real scenario, you might want to simulate connection errors
            const result = await redis.ping();
            expect(result).toBe('PONG');
        });

        it('should handle operation timeout gracefully', async () => {
            // This test is a placeholder for timeout handling
            // In a real scenario, you might want to simulate timeouts
            const result = await redis.get(TEST_STRING_KEY);
            expect(result).toBe(TEST_STRING_VALUE);
        });
    });
});
