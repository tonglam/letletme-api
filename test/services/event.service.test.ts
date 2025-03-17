import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { dataRedis } from '../../src/redis';
import * as eventService from '../../src/services/event.service';
import * as eventUtils from '../../src/utils';
import * as cacheUtils from '../../src/utils/cache.utils';
import { eventKeys } from '../../src/utils/redis-key.utils';
import {
    EXPECTED_SCORES,
    MOCK_EVENT_DATA,
    MOCK_EVENT_DEADLINES,
    MOCK_SEASON,
} from '../data/event.data';

describe('Event Service', () => {
    // Spy on functions
    let getJsonSpy: ReturnType<typeof spyOn>;
    let getFromCacheSpy: ReturnType<typeof spyOn>;
    let setToCacheSpy: ReturnType<typeof spyOn>;
    let getCurrentSeasonSpy: ReturnType<typeof spyOn>;
    let determineCurrentEventSpy: ReturnType<typeof spyOn>;
    let hgetallSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
        // Mock Redis operations
        getJsonSpy = spyOn(dataRedis, 'getJson').mockImplementation(
            async <T>(key: string): Promise<T | null> => {
                if (key === eventKeys.eventOverallResult(MOCK_SEASON)) {
                    return MOCK_EVENT_DATA as unknown as T;
                }
                return null;
            },
        );

        // Mock Redis hgetall
        hgetallSpy = spyOn(dataRedis, 'hgetall').mockImplementation(
            async (key: string): Promise<Record<string, string>> => {
                if (key === eventKeys.eventDeadlines(MOCK_SEASON)) {
                    // Convert deadlines to JSON strings
                    const deadlines: Record<string, string> = {};
                    for (const [eventId, deadline] of Object.entries(
                        MOCK_EVENT_DEADLINES,
                    )) {
                        deadlines[eventId] = JSON.stringify(deadline);
                    }
                    return deadlines;
                }
                if (key === eventKeys.eventOverallResult(MOCK_SEASON)) {
                    return MOCK_EVENT_DATA;
                }
                return {};
            },
        );

        // Mock cache operations
        getFromCacheSpy = spyOn(cacheUtils, 'getFromCache').mockImplementation(
            async () => null,
        );
        setToCacheSpy = spyOn(cacheUtils, 'setToCache').mockImplementation(
            async () => {},
        );

        // Mock utils functions
        getCurrentSeasonSpy = spyOn(
            eventUtils,
            'getCurrentSeason',
        ).mockReturnValue(MOCK_SEASON);
        determineCurrentEventSpy = spyOn(
            eventUtils,
            'determineCurrentEventAndDeadline',
        ).mockReturnValue({
            event: 3,
            utcDeadline: MOCK_EVENT_DEADLINES['3'],
        });
    });

    afterEach(() => {
        // Restore original implementations
        getJsonSpy.mockRestore();
        getFromCacheSpy.mockRestore();
        setToCacheSpy.mockRestore();
        getCurrentSeasonSpy.mockRestore();
        determineCurrentEventSpy.mockRestore();
        hgetallSpy.mockRestore();
    });

    describe('getCurrentEventAndDeadline', () => {
        it('should return current event and deadline', async () => {
            const result = await eventService.getCurrentEventAndDeadline();
            expect(result).toEqual({
                event: 3,
                utcDeadline: MOCK_EVENT_DEADLINES['3'],
            });
            expect(getCurrentSeasonSpy).toHaveBeenCalledTimes(1);
            expect(hgetallSpy).toHaveBeenCalledTimes(1);
            expect(determineCurrentEventSpy).toHaveBeenCalledTimes(1);
        });

        it('should handle missing deadlines', async () => {
            hgetallSpy.mockResolvedValueOnce({});
            await expect(
                eventService.getCurrentEventAndDeadline(),
            ).rejects.toThrow('Event deadlines not found in Redis');
        });
    });

    describe('getEventAverageScores', () => {
        it('should return average scores from Redis', async () => {
            const result = await eventService.getEventAverageScores();
            expect(result).toEqual(EXPECTED_SCORES);
            expect(hgetallSpy).toHaveBeenCalledWith(
                eventKeys.eventOverallResult(MOCK_SEASON),
            );
        });

        it('should handle missing data', async () => {
            hgetallSpy.mockResolvedValueOnce({});
            await expect(eventService.getEventAverageScores()).rejects.toThrow(
                'Event overall results not found in Redis',
            );
        });

        it('should handle Redis errors', async () => {
            hgetallSpy.mockRejectedValueOnce(new Error('Redis error'));
            await expect(eventService.getEventAverageScores()).rejects.toThrow(
                'Redis error',
            );
        });

        it('should handle invalid JSON data', async () => {
            hgetallSpy.mockResolvedValueOnce({
                '1': 'invalid-json',
                '2': '{"not": "java-format"}',
            });
            const result = await eventService.getEventAverageScores();
            expect(result).toEqual({ scores: {} });
        });
    });
});
