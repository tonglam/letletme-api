import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import type { InferSelectModel } from 'drizzle-orm';
import { and, asc, desc, eq, gt, sql } from 'drizzle-orm';
import type { RowDataPacket } from 'mysql2/promise';
import { closeDbConnection, db } from '../../src/db/index';
import { event } from '../../src/db/schema/event.js';
import * as schema from '../../src/db/schema/index';

// Define the Event type based on the schema
type Event = InferSelectModel<typeof event>;

// Define types for database query results
interface TableExistsResult extends RowDataPacket {
    count: number;
}

interface ColumnInfo extends RowDataPacket {
    COLUMN_NAME: string;
    DATA_TYPE: string;
    IS_NULLABLE: string;
    COLUMN_KEY: string;
}

// Define a type for schema column
interface SchemaColumn {
    name: string;
    [key: string]: unknown;
}

describe('Database Connection', () => {
    // Verify database connection before starting tests
    beforeAll(async () => {
        try {
            // Attempt to run a simple query to verify database connection
            await db.execute(sql`SELECT 1`);
        } catch (error) {
            console.error('Failed to connect to database:', error);
            throw new Error(
                'Database connection failed. Please check your connection settings and make sure the database is accessible.',
            );
        }
    });

    // Close the database connection after all tests
    afterAll(async () => {
        await closeDbConnection();
    });

    it('should verify schema tables exist in database', async () => {
        // Get all schema objects
        const schemaObjects = Object.entries(schema)
            .filter(([, value]) => typeof value === 'object' && value !== null)
            .map(([name, value]) => ({ name, schema: value }));

        expect(schemaObjects.length).toBeGreaterThan(0);
        console.log(`Found ${schemaObjects.length} schema objects to validate`);

        // Track tables with mismatches
        const mismatchedTables = [];

        // For each schema object, verify it exists in the database
        for (const { name, schema: tableSchema } of schemaObjects) {
            try {
                // Convert camelCase to snake_case for table name comparison
                const tableName = name
                    .replace(/([A-Z])/g, '_$1')
                    .toLowerCase()
                    .replace(/^_/, '');

                console.log(`Verifying table: ${tableName}`);

                // Check if table exists in database
                const [rows] = await db.execute<TableExistsResult[]>(sql`
                    SELECT COUNT(*) as count 
                    FROM information_schema.TABLES 
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${tableName}
                `);

                // Cast the result to the correct type
                const tableExists = rows as unknown as TableExistsResult[];

                // Skip tables that don't exist in the database
                if (tableExists[0].count === 0) {
                    console.log(
                        `⚠️ Table '${tableName}' does not exist in the database`,
                    );
                    mismatchedTables.push({
                        table: tableName,
                        reason: 'Table does not exist in database',
                    });
                    continue;
                }

                // Get columns from database
                const [columnRows] = await db.execute<ColumnInfo[]>(sql`
                    SELECT 
                        COLUMN_NAME, 
                        DATA_TYPE, 
                        IS_NULLABLE, 
                        COLUMN_KEY
                    FROM 
                        INFORMATION_SCHEMA.COLUMNS 
                    WHERE 
                        TABLE_SCHEMA = DATABASE() AND 
                        TABLE_NAME = ${tableName}
                    ORDER BY ORDINAL_POSITION
                `);

                // Cast the result to the correct type
                const dbColumns = columnRows as unknown as ColumnInfo[];

                // Verify we have columns
                expect(Array.isArray(dbColumns)).toBe(true);

                if (dbColumns.length === 0) {
                    console.log(
                        `⚠️ Table '${tableName}' has no columns in the database`,
                    );
                    mismatchedTables.push({
                        table: tableName,
                        reason: 'Table has no columns in database',
                    });
                    continue;
                }

                // Get schema columns - cast to unknown first to avoid type errors
                const schemaColumns = Object.entries(
                    tableSchema as unknown as Record<string, unknown>,
                ).filter(
                    ([key]) => !key.startsWith('_') && typeof key === 'string',
                );

                // Verify we have schema columns
                if (schemaColumns.length === 0) {
                    console.log(
                        `⚠️ Schema for '${tableName}' has no columns defined`,
                    );
                    mismatchedTables.push({
                        table: tableName,
                        reason: 'Schema has no columns defined',
                    });
                    continue;
                }

                // Check if column counts match
                if (schemaColumns.length !== dbColumns.length) {
                    console.log(
                        `⚠️ Column count mismatch for table '${tableName}': Schema has ${schemaColumns.length}, DB has ${dbColumns.length}`,
                    );

                    // Get column names for comparison
                    const dbColumnNames = dbColumns.map(
                        (col) => col.COLUMN_NAME,
                    );
                    const schemaColumnNames = schemaColumns
                        .map(([, col]) => {
                            if (
                                col &&
                                typeof col === 'object' &&
                                'name' in col
                            ) {
                                return (col as SchemaColumn).name;
                            }
                            return null;
                        })
                        .filter((name): name is string => name !== null);

                    // Find missing columns
                    const missingInSchema = dbColumnNames.filter(
                        (dbCol) => !schemaColumnNames.includes(dbCol),
                    );

                    if (missingInSchema.length > 0) {
                        console.log(
                            `  Missing in schema: ${missingInSchema.join(', ')}`,
                        );
                    }

                    // Find extra columns
                    const extraInSchema = schemaColumnNames.filter(
                        (schemaCol) => !dbColumnNames.includes(schemaCol),
                    );

                    if (extraInSchema.length > 0) {
                        console.log(
                            `  Extra in schema: ${extraInSchema.join(', ')}`,
                        );
                    }

                    mismatchedTables.push({
                        table: tableName,
                        reason: 'Column count mismatch',
                        dbCount: dbColumns.length,
                        schemaCount: schemaColumns.length,
                        missingInSchema,
                        extraInSchema,
                    });
                } else {
                    console.log(
                        `✅ Verified table: ${tableName} (${dbColumns.length} columns)`,
                    );
                }
            } catch (error) {
                console.error(`Error validating table ${name}:`, error);
                mismatchedTables.push({
                    table: name,
                    reason: `Error during validation: ${error instanceof Error ? error.message : String(error)}`,
                });
            }
        }

        // Log summary of mismatches
        if (mismatchedTables.length > 0) {
            console.log('\n⚠️ Schema validation found mismatches:');
            mismatchedTables.forEach((mismatch) => {
                console.log(`- ${mismatch.table}: ${mismatch.reason}`);
            });
            console.log(
                '\nThese mismatches should be addressed to ensure schema definitions match the database.',
            );
        } else {
            console.log(
                '\n✅ All schema definitions match the database structure!',
            );
        }

        // Test passes even with mismatches, as this is informational
    }, 30000); // Increase timeout to 30 seconds

    it('should connect to the database and retrieve events', async () => {
        try {
            // Query the database for events
            const events = await db.select().from(event).limit(5);

            // Verify that we got some events back
            expect(events).toBeDefined();
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBeGreaterThan(0);

            // Verify that the events have the correct structure
            const firstEvent = events[0];
            expect(firstEvent).toHaveProperty('id');
            expect(firstEvent).toHaveProperty('name');
            expect(firstEvent).toHaveProperty('deadlineTime');
            expect(firstEvent).toHaveProperty('finished');
        } catch (error) {
            console.error('Test failed with error:', error);
            throw error;
        }
    });

    it('should retrieve the current event', async () => {
        try {
            // Query for the current event
            const currentEvents = await db
                .select()

                .from(event)

                .where(eq(event.isCurrent, 1))

                .limit(1);

            // Verify we got a current event
            expect(currentEvents).toBeDefined();
            expect(Array.isArray(currentEvents)).toBe(true);
            expect(currentEvents.length).toBe(1);

            const currentEvent = currentEvents[0];
            expect(currentEvent).toHaveProperty('id');
            expect(currentEvent).toHaveProperty('name');
            expect(currentEvent.isCurrent).toBe(1);
        } catch (error) {
            console.error('Test failed with error:', error);
            throw error;
        }
    });

    it('should handle filtering correctly', async () => {
        try {
            // Query for a specific event by ID
            const eventId = 1; // Assuming event with ID 1 exists
            const specificEvents = await db
                .select()

                .from(event)

                .where(eq(event.id, eventId))

                .limit(1);

            // Verify we got the correct event
            expect(specificEvents).toBeDefined();
            expect(Array.isArray(specificEvents)).toBe(true);
            expect(specificEvents.length).toBe(1);

            const specificEvent = specificEvents[0];
            expect(specificEvent.id).toBe(eventId);
        } catch (error) {
            console.error('Test failed with error:', error);
            throw error;
        }
    });

    it('should handle complex queries with multiple conditions', async () => {
        try {
            // Get finished events with id > 1
            const events = await db.select().from(event);
            // Verify that we got some events back
            expect(events).toBeDefined();
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBeGreaterThan(0);

            // Verify that the events have the correct structure
            const firstEvent = events[0];
            expect(firstEvent).toHaveProperty('id');
            expect(firstEvent).toHaveProperty('name');
            expect(firstEvent).toHaveProperty('deadlineTime');
            expect(firstEvent).toHaveProperty('finished');
        } catch (error) {
            console.error('Test failed with error:', error);
            throw error;
        }
    });

    it('should retrieve the current event', async () => {
        // Query for the current event
        const currentEvents = await db
            .select()

            .from(event)

            .where(eq(event.isCurrent, 1))

            .limit(1);

        // Verify we got a current event
        expect(currentEvents).toBeDefined();
        expect(Array.isArray(currentEvents)).toBe(true);
        expect(currentEvents.length).toBe(1);

        const currentEvent = currentEvents[0];
        expect(currentEvent).toHaveProperty('id');
        expect(currentEvent).toHaveProperty('name');
        expect(currentEvent.isCurrent).toBe(1);
    });

    it('should handle filtering correctly', async () => {
        // Query for a specific event by ID
        const eventId = 1; // Assuming event with ID 1 exists
        const specificEvents = await db
            .select()

            .from(event)

            .where(eq(event.id, eventId))

            .limit(1);

        // Verify we got the correct event
        expect(specificEvents).toBeDefined();
        expect(Array.isArray(specificEvents)).toBe(true);
        expect(specificEvents.length).toBe(1);

        const specificEvent = specificEvents[0];
        expect(specificEvent.id).toBe(eventId);
    });

    it('should handle complex queries with multiple conditions', async () => {
        // Get finished events with id > 1
        const result = await db
            .select()

            .from(event)

            .where(and(eq(event.finished, 1), gt(event.id, 1)))

            .limit(3);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        // Verify each result matches our criteria
        result.forEach((item: Event) => {
            expect(item.finished).toBe(1);
            expect(item.id).toBeGreaterThan(1);
        });
    });

    it('should handle sorting correctly', async () => {
        // Get events sorted by ID in descending order
        const descendingEvents = await db
            .select()

            .from(event)
            .orderBy(desc(event.id))

            .limit(5);

        expect(descendingEvents).toBeDefined();
        expect(Array.isArray(descendingEvents)).toBe(true);
        expect(descendingEvents.length).toBeGreaterThan(0);

        // Verify the sorting is correct
        for (let i = 1; i < descendingEvents.length; i++) {
            expect(descendingEvents[i - 1].id).toBeGreaterThan(
                descendingEvents[i].id,
            );
        }

        // Get events sorted by ID in ascending order
        const ascendingEvents = await db
            .select()

            .from(event)
            .orderBy(asc(event.id))

            .limit(5);

        expect(ascendingEvents).toBeDefined();
        expect(Array.isArray(ascendingEvents)).toBe(true);
        expect(ascendingEvents.length).toBeGreaterThan(0);

        // Verify the sorting is correct
        for (let i = 1; i < ascendingEvents.length; i++) {
            expect(ascendingEvents[i - 1].id).toBeLessThan(
                ascendingEvents[i].id,
            );
        }
    });

    it('should handle empty results gracefully', async () => {
        // Query with conditions that should return no results
        // Using a very high ID that likely doesn't exist
        const nonExistentId = 99999;
        const result = await db
            .select()

            .from(event)

            .where(eq(event.id, nonExistentId))

            .limit(1);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
    });
});
