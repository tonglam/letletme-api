import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { redis } from '../../src/redis';

// Test key prefix to avoid conflicts with actual application data
const TEST_KEY_PREFIX = 'test:redis:';

// These keys should already exist in your Redis instance for testing
// You need to manually create these keys in Redis before running the tests
const EXISTING_STRING_KEY = 'test:existing:string';
const EXISTING_STRING_VALUE = 'test-value';
const EXISTING_JSON_KEY = 'test:existing:json';
const EXISTING_JSON_VALUE = { name: 'test', value: 123 };
const EXISTING_MULTI_KEYS = ['test:existing:multi:1', 'test:existing:multi:2'];
const EXISTING_MULTI_VALUES = ['multi-value-1', 'multi-value-2'];

describe('Redis Client', () => {
    // Setup before all tests
    beforeAll(async () => {
        // Initialize Redis connection
        redis.getClient();

        // Note: In a real test scenario, you would need to manually set up these keys
        // in your Redis instance before running the tests:
        // - test:existing:string with value 'test-value'
        // - test:existing:json with value { name: 'test', value: 123 }
        // - test:existing:multi:1 with value 'multi-value-1'
        // - test:existing:multi:2 with value 'multi-value-2'
    });

    // Cleanup after all tests
    afterAll(async () => {
        // Close Redis connection
        await redis.close();
    });

    // Test connection
    it('should connect to Redis server', async () => {
        const ping = await redis.getClient().ping();
        expect(ping).toBe('PONG');
    });

    // Test get operation (with non-existent key)
    it('should return null for non-existent key', async () => {
        const key = `${TEST_KEY_PREFIX}non-existent`;
        const value = await redis.get(key);
        expect(value).toBeNull();
    });

    // Test exists operation (with non-existent key)
    it('should return false for non-existent key exists check', async () => {
        const key = `${TEST_KEY_PREFIX}non-existent`;
        const exists = await redis.exists(key);
        expect(exists).toBe(false);
    });

    // Test getJson operation (with non-existent key)
    it('should return null for non-existent JSON key', async () => {
        const key = `${TEST_KEY_PREFIX}non-existent-json`;
        const value = await redis.getJson(key);
        expect(value).toBeNull();
    });

    // Test mGet operation (with non-existent keys)
    it('should return nulls for non-existent keys in mGet', async () => {
        const keys = [
            `${TEST_KEY_PREFIX}non-existent-1`,
            `${TEST_KEY_PREFIX}non-existent-2`,
        ];
        const values = await redis.mGet(keys);
        expect(values).toEqual([null, null]);
    });

    // Test reading existing string value
    it('should read an existing string value', async () => {
        const value = await redis.get(EXISTING_STRING_KEY);
        expect(value).toBe(EXISTING_STRING_VALUE);
    });

    // Test exists for existing key
    it('should return true for existing key exists check', async () => {
        const exists = await redis.exists(EXISTING_STRING_KEY);
        expect(exists).toBe(true);
    });

    // Test reading existing JSON value
    it('should read an existing JSON value', async () => {
        const value = await redis.getJson(EXISTING_JSON_KEY);
        expect(value).toEqual(EXISTING_JSON_VALUE);
    });

    // Test reading multiple existing values
    it('should read multiple existing values', async () => {
        const values = await redis.mGet(EXISTING_MULTI_KEYS);
        expect(values).toEqual(EXISTING_MULTI_VALUES);
    });

    // Test client info
    it('should get client info', async () => {
        const info = await redis.getClient().info();
        expect(info).toBeDefined();
        expect(typeof info).toBe('string');
        expect(info.includes('redis_version')).toBe(true);
    });

    // Test database size
    it('should get database size', async () => {
        const dbSize = await redis.getClient().dbsize();
        expect(dbSize).toBeGreaterThan(0);
    });
});
