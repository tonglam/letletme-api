import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/db';
import { logger } from '../config/logger';
import * as schema from './schema/index';

// Create database connection pool - this is a singleton due to module caching
const poolConnection = mysql.createPool(dbConfig);

// Create Drizzle instance with the schema - this is a singleton due to module caching
export const db = drizzle(poolConnection, { schema, mode: 'default' });

/**
 * Allow explicit cleanup when needed
 */
export async function closeDbConnection(): Promise<void> {
    await poolConnection.end();
}

/**
 * Helper function to check connection health
 */
export async function checkConnection(): Promise<boolean> {
    try {
        await poolConnection.query('SELECT 1');
        return true;
    } catch (error) {
        logger.error({ err: error }, 'Database health check failed');
        return false;
    }
}

/**
 * Get the raw connection pool
 */
export function getConnectionPool(): mysql.Pool {
    return poolConnection;
}

// Export the schema module
export * as schema from './schema/index';

// Export a single object with all database operations for consistency with Redis
export const database = {
    db,
    closeDbConnection,
    checkConnection,
    getConnectionPool,
};
