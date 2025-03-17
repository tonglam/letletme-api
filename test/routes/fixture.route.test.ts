import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { logger } from '../../src/config/logger.config';
import { cacheRedis, dataRedis } from '../../src/redis';
import { fixtureRoutes } from '../../src/routes/v1/fixture.route';
import type { NextGameweekFixture } from '../../src/types/fixture.type';
import { clearServiceCache } from '../../src/utils/cache.utils';
import {
    ServiceName,
    eventKeys,
    teamKeys,
} from '../../src/utils/redis-key.utils';

describe('Fixture Routes Integration Tests', () => {
    let app: Elysia;

    beforeAll(async () => {
        app = new Elysia().use(fixtureRoutes);
        // Only clear fixture cache in cache Redis
        await clearServiceCache(ServiceName.EVENT_FIXTURE);
    });

    afterAll(async () => {
        await dataRedis.close();
        await cacheRedis.close();
    });

    describe('GET /fixtures/next-gameweek', () => {
        it('should return next gameweek fixtures with valid data', async () => {
            // Test Redis connection
            const currentEvent = await dataRedis.get(eventKeys.currentEvent());
            logger.info({ currentEvent }, 'Current event from Redis');

            // Get event deadlines
            const eventDeadlines = await dataRedis.hgetall(
                eventKeys.eventDeadlines('2425'),
            );
            logger.info({ eventDeadlines }, 'Event deadlines from Redis');

            // Get fixtures for event 30
            const fixtures = await dataRedis.smembers(
                eventKeys.eventFixtures('2425', '30'),
            );
            logger.info({ fixtures }, 'Event 30 fixtures from Redis');

            // Get team names
            const teamNames = await dataRedis.hgetall(
                teamKeys.teamNames('2425'),
            );
            logger.info({ teamNames }, 'Team names from Redis');

            // Get team short names
            const teamShortNames = await dataRedis.hgetall(
                teamKeys.teamShortNames('2425'),
            );
            logger.info({ teamShortNames }, 'Team short names from Redis');

            const response = await app.handle(
                new Request('http://localhost/fixtures/next-gameweek'),
            );

            expect(response.status).toBe(200);
            const responseFixtures =
                (await response.json()) as NextGameweekFixture[];
            logger.info({ responseFixtures }, 'Response fixtures');

            // Verify response structure
            expect(Array.isArray(responseFixtures)).toBe(true);
            expect(responseFixtures.length).toBeGreaterThan(0);

            const fixture = responseFixtures[0];

            // Verify fixture structure
            expect(fixture).toHaveProperty('event');
            expect(fixture).toHaveProperty('teamId');
            expect(fixture).toHaveProperty('teamName');
            expect(fixture).toHaveProperty('teamShortName');
            expect(fixture).toHaveProperty('againstTeamId');
            expect(fixture).toHaveProperty('againstTeamName');
            expect(fixture).toHaveProperty('againstTeamShortName');
            expect(fixture).toHaveProperty('difficulty');
            expect(fixture).toHaveProperty('kickoffTime');
            expect(fixture).toHaveProperty('started');
            expect(fixture).toHaveProperty('finished');
            expect(fixture).toHaveProperty('wasHome');
            expect(fixture).toHaveProperty('teamScore');
            expect(fixture).toHaveProperty('againstTeamScore');
            expect(fixture).toHaveProperty('score');
            expect(fixture).toHaveProperty('result');
            expect(fixture).toHaveProperty('bgw');
            expect(fixture).toHaveProperty('dgw');

            // Verify data types
            expect(typeof fixture.event).toBe('number');
            expect(typeof fixture.teamId).toBe('number');
            expect(typeof fixture.teamName).toBe('string');
            expect(typeof fixture.teamShortName).toBe('string');
            expect(typeof fixture.againstTeamId).toBe('number');
            expect(typeof fixture.againstTeamName).toBe('string');
            expect(typeof fixture.againstTeamShortName).toBe('string');
            expect(typeof fixture.difficulty).toBe('number');
            expect(typeof fixture.started).toBe('boolean');
            expect(typeof fixture.finished).toBe('boolean');
            expect(typeof fixture.wasHome).toBe('boolean');
            expect(typeof fixture.teamScore).toBe('number');
            expect(typeof fixture.againstTeamScore).toBe('number');
            expect(typeof fixture.score).toBe('string');
            expect(['W', 'L', 'D', ''].includes(fixture.result)).toBe(true);
            expect(typeof fixture.bgw).toBe('boolean');
            expect(typeof fixture.dgw).toBe('boolean');

            // Verify value ranges
            expect(fixture.event).toBeGreaterThan(0);
            expect(fixture.event).toBeLessThanOrEqual(38);
            expect(fixture.teamId).toBeGreaterThan(0);
            expect(fixture.teamId).toBeLessThanOrEqual(20);
            expect(fixture.againstTeamId).toBeGreaterThan(0);
            expect(fixture.againstTeamId).toBeLessThanOrEqual(20);
            expect(fixture.difficulty).toBeGreaterThanOrEqual(1);
            expect(fixture.difficulty).toBeLessThanOrEqual(5);
            expect(fixture.teamScore).toBeGreaterThanOrEqual(0);
            expect(fixture.againstTeamScore).toBeGreaterThanOrEqual(0);

            // Verify kickoff time is a valid future or past date
            expect(() => new Date(fixture.kickoffTime)).not.toThrow();

            // Verify score format
            expect(fixture.score).toMatch(/^\d+-\d+$/);

            // Verify team names are not empty
            expect(fixture.teamName.length).toBeGreaterThan(0);
            expect(fixture.teamShortName.length).toBeGreaterThan(0);
            expect(fixture.againstTeamName.length).toBeGreaterThan(0);
            expect(fixture.againstTeamShortName.length).toBeGreaterThan(0);
        });
    });
});
