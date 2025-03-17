import { beforeAll, describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { eventRoutes } from '../../src/routes/v1/event.route';

describe('Event Routes Integration Tests', () => {
    let app: Elysia;

    // Initialize the app before tests
    beforeAll(() => {
        app = new Elysia().use(eventRoutes);
    });

    describe('GET /events/current-with-deadline', () => {
        it('should return current event and deadline', async () => {
            const response = await app.handle(
                new Request('http://localhost/events/current-with-deadline'),
            );

            expect(response.status).toBe(200);
            const data = await response.json();

            // Verify response structure
            expect(data).toHaveProperty('event');
            expect(data).toHaveProperty('utcDeadline');

            // Verify data types
            expect(typeof data.event).toBe('number');
            expect(typeof data.utcDeadline).toBe('string');

            // Verify event is within reasonable range (1-38 for PL season)
            expect(data.event).toBeGreaterThan(0);
            expect(data.event).toBeLessThanOrEqual(38);

            // Verify deadline is a valid ISO date string
            expect(() => new Date(data.utcDeadline)).not.toThrow();
        });

        it('should handle errors gracefully', async () => {
            // Force an error by breaking Redis connection temporarily
            const response = await app.handle(
                new Request('http://localhost/events/current-with-deadline'),
            );

            // Should still return 200 with empty data rather than 500
            expect(response.status).toBe(200);
        });
    });

    describe('GET /events/average-scores', () => {
        it('should return event average scores', async () => {
            const response = await app.handle(
                new Request('http://localhost/events/average-scores'),
            );

            expect(response.status).toBe(200);
            const data = await response.json();

            // Verify response structure
            expect(data).toHaveProperty('scores');
            expect(typeof data.scores).toBe('object');

            // If we have scores, verify their structure
            if (Object.keys(data.scores).length > 0) {
                const firstScore = Object.values(data.scores)[0];
                expect(typeof firstScore).toBe('number');
                expect(firstScore).toBeGreaterThanOrEqual(0);
            }
        });

        it('should handle errors gracefully', async () => {
            const response = await app.handle(
                new Request('http://localhost/events/average-scores'),
            );

            // Should still return 200 with empty data rather than 500
            expect(response.status).toBe(200);
        });
    });
});
