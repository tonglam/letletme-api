import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    mock,
    spyOn,
} from 'bun:test';
import type { Redis } from 'ioredis';
import { eventConfig } from '../../src/config/event';
import { redis } from '../../src/redis';
import * as eventService from '../../src/services/event.service';
import * as eventUtils from '../../src/utils';
import {
    EXPECTED_SCORES,
    MOCK_CACHE_KEY,
    MOCK_EVENT_DATA,
    MOCK_EVENT_DEADLINE_KEY,
    MOCK_EVENT_DEADLINES,
    MOCK_REDIS_KEY,
    MOCK_SEASON,
} from '../data/event.data';

// Counter for mock calls
let mockGetJsonCalls = 0;

describe('Event Service', () => {
    // Spy on functions
    let getClientSpy: ReturnType<typeof spyOn>;
    let getJsonSpy: ReturnType<typeof spyOn>;
    let setJsonSpy: ReturnType<typeof spyOn>;
    let delSpy: ReturnType<typeof spyOn>;
    let getCurrentSeasonSpy: ReturnType<typeof spyOn>;
    let determineCurrentEventSpy: ReturnType<typeof spyOn>;
    let getEventDeadlinesSpy: ReturnType<typeof spyOn>;
    let getEventAverageScoresSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
        // Reset counter
        mockGetJsonCalls = 0;

        // Mock redis.getClient
        getClientSpy = spyOn(redis, 'getClient').mockImplementation(() => {
            return {
                hgetall: mock(async (key: string) => {
                    if (key === MOCK_REDIS_KEY) {
                        return MOCK_EVENT_DATA;
                    } else if (key === MOCK_EVENT_DEADLINE_KEY) {
                        return MOCK_EVENT_DEADLINES;
                    }
                    return {};
                }),
                ping: mock(async () => 'PONG'),
            } as unknown as Redis;
        });

        // Mock redis.getJson
        getJsonSpy = spyOn(redis, 'getJson').mockImplementation(
            async <T>(key: string): Promise<T | null> => {
                if (key === MOCK_CACHE_KEY) {
                    // First call returns null (cache miss), second call returns cached data
                    if (mockGetJsonCalls === 0) {
                        mockGetJsonCalls++;
                        return null;
                    }
                    return EXPECTED_SCORES as unknown as T;
                } else if (key === eventConfig.cache.key) {
                    // Return null for the first call to simulate cache miss
                    if (mockGetJsonCalls === 0) {
                        mockGetJsonCalls++;
                        return null;
                    }
                    // Return cached event and deadline for subsequent calls
                    return {
                        currentEvent: '3',
                        nextDeadline: MOCK_EVENT_DEADLINES['4'],
                    } as unknown as T;
                }
                return null;
            },
        );

        // Mock redis.setJson
        setJsonSpy = spyOn(redis, 'setJson').mockImplementation(async () => {});

        // Mock redis.del
        delSpy = spyOn(redis, 'del').mockImplementation(async () => {});

        // Mock getCurrentSeason
        getCurrentSeasonSpy = spyOn(
            eventUtils,
            'getCurrentSeason',
        ).mockImplementation(() => MOCK_SEASON);

        // Mock determineCurrentEventAndDeadline
        determineCurrentEventSpy = spyOn(
            eventUtils,
            'determineCurrentEventAndDeadline',
        ).mockImplementation(() => ({
            currentEvent: '3',
            nextDeadline: MOCK_EVENT_DEADLINES['4'],
        }));

        // Mock getEventDeadlinesFromRedis
        getEventDeadlinesSpy = spyOn(
            eventUtils,
            'getEventDeadlinesFromRedis',
        ).mockImplementation(async () => [
            { event: '1', deadline: MOCK_EVENT_DEADLINES['1'] },
            { event: '2', deadline: MOCK_EVENT_DEADLINES['2'] },
            { event: '3', deadline: MOCK_EVENT_DEADLINES['3'] },
            { event: '4', deadline: MOCK_EVENT_DEADLINES['4'] },
            { event: '5', deadline: MOCK_EVENT_DEADLINES['5'] },
            { event: '38', deadline: MOCK_EVENT_DEADLINES['38'] },
        ]);
    });

    afterEach(() => {
        // Restore original implementations
        getClientSpy.mockRestore();
        getJsonSpy.mockRestore();
        setJsonSpy.mockRestore();
        delSpy.mockRestore();
        getCurrentSeasonSpy.mockRestore();
        determineCurrentEventSpy.mockRestore();
        getEventDeadlinesSpy.mockRestore();
        if (getEventAverageScoresSpy) {
            getEventAverageScoresSpy.mockRestore();
        }
    });

    describe('getCurrentEventAndDeadline', () => {
        it('should return cached event and deadline if available', async () => {
            // First call will miss cache, second will hit
            await eventService.getCurrentEventAndDeadline();
            const result = await eventService.getCurrentEventAndDeadline();

            expect(result).toEqual({
                currentEvent: '3',
                nextDeadline: MOCK_EVENT_DEADLINES['4'],
            });
            expect(getJsonSpy).toHaveBeenCalledTimes(2);
            expect(getJsonSpy).toHaveBeenCalledWith(eventConfig.cache.key);
        });

        it('should fetch and process data from Redis on cache miss', async () => {
            // Reset counter to ensure cache miss
            mockGetJsonCalls = 0;

            // Mock Date.now to return a fixed timestamp between event 3 and 4
            const originalDateNow = Date.now;
            global.Date.now = (): number =>
                new Date('2023-08-26T12:00:00Z').getTime();

            try {
                const result = await eventService.getCurrentEventAndDeadline();

                expect(result).toEqual({
                    currentEvent: '3',
                    nextDeadline: MOCK_EVENT_DEADLINES['4'],
                });
                expect(getEventDeadlinesSpy).toHaveBeenCalled();
                expect(setJsonSpy).toHaveBeenCalledWith(
                    eventConfig.cache.key,
                    {
                        currentEvent: '3',
                        nextDeadline: MOCK_EVENT_DEADLINES['4'],
                    },
                    eventConfig.cache.ttl,
                );
            } finally {
                // Restore original Date.now
                global.Date.now = originalDateNow;
            }
        });

        it('should handle Redis errors gracefully', async () => {
            // Mock Redis to throw an error
            getJsonSpy.mockImplementation(async () => {
                throw new Error('Redis connection error');
            });

            let errorMessage = '';
            try {
                await eventService.getCurrentEventAndDeadline();
            } catch (error) {
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
            }

            expect(errorMessage).toContain(
                'Failed to get current event and deadline',
            );
            expect(errorMessage).toContain('Redis connection error');
        });

        it('should handle empty event data gracefully', async () => {
            // Mock empty event data
            getEventDeadlinesSpy.mockImplementation(async () => {
                throw new Error('No event data found');
            });

            let errorMessage = '';
            try {
                await eventService.getCurrentEventAndDeadline();
            } catch (error) {
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
            }

            expect(errorMessage).toBe(
                'Failed to get current event and deadline: Error: No event data found',
            );
        });
    });

    describe('getEventAverageScores', () => {
        it('should return cached scores if available', async () => {
            // First call will miss cache, second will hit
            await eventService.getEventAverageScores();
            const result = await eventService.getEventAverageScores();

            expect(result).toEqual(EXPECTED_SCORES);
            expect(getJsonSpy).toHaveBeenCalledTimes(2);
            expect(getJsonSpy).toHaveBeenCalledWith(MOCK_CACHE_KEY);
        });

        it('should fetch and process data from Redis on cache miss', async () => {
            // Mock the processing of event data to return expected scores
            getEventAverageScoresSpy = spyOn(
                eventService,
                'getEventAverageScores',
            ).mockImplementation(async () => EXPECTED_SCORES);

            const result = await eventService.getEventAverageScores();
            expect(result).toEqual(EXPECTED_SCORES);
        });

        it('should handle Redis errors gracefully', async () => {
            // Mock Redis to throw an error
            getJsonSpy.mockImplementation(async () => {
                throw new Error('Redis connection error');
            });

            let errorMessage = '';
            try {
                await eventService.getEventAverageScores();
            } catch (error) {
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
            }

            expect(errorMessage).toBe(
                'Failed to get event average scores: Error: Redis connection error',
            );
        });
    });

    describe('refreshEventAverageScores', () => {
        it('should clear the cache', async () => {
            await eventService.refreshEventAverageScores();

            expect(delSpy).toHaveBeenCalledWith(MOCK_CACHE_KEY);
        });

        it('should handle errors gracefully', async () => {
            // Mock Redis to throw an error
            delSpy.mockImplementation(async () => {
                throw new Error('Redis connection error');
            });

            let errorMessage = '';
            try {
                await eventService.refreshEventAverageScores();
            } catch (error) {
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
            }

            expect(errorMessage).toBe(
                'Failed to refresh event average scores: Error: Redis connection error',
            );
        });
    });
});
