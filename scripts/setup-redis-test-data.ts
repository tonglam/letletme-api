import { redis } from '../src/redis/client';

/**
 * This script sets up test data in Redis for the Redis unit tests.
 * Run this script before running the Redis tests.
 */
async function setupRedisTestData() {
    console.log('Setting up Redis test data...');

    try {
        // Set up string value
        await redis.set('test:existing:string', 'test-value');
        console.log('Set test:existing:string');

        // Set up JSON value
        await redis.setJson('test:existing:json', { name: 'test', value: 123 });
        console.log('Set test:existing:json');

        // Set up multiple values
        await redis.set('test:existing:multi:1', 'multi-value-1');
        await redis.set('test:existing:multi:2', 'multi-value-2');
        console.log('Set test:existing:multi:1 and test:existing:multi:2');

        console.log('Redis test data setup complete!');
    } catch (error) {
        console.error('Error setting up Redis test data:', error);
    } finally {
        // Close Redis connection
        await redis.close();
    }
}

// Run the setup function
setupRedisTestData();
