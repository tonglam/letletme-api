import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { dataRedis } from '../../src/redis';
import * as fixtureService from '../../src/services/fixture.service';
import type { Fixture } from '../../src/types/fixture.type';
import * as cacheUtils from '../../src/utils/cache.utils';
import * as eventUtils from '../../src/utils/event.utils';
import { eventKeys, teamKeys } from '../../src/utils/redis-key.utils';
import {
    EXPECTED_NEXT_GAMEWEEK_FIXTURES,
    MOCK_CURRENT_EVENT,
    MOCK_FIXTURES,
    MOCK_NEXT_EVENT,
    MOCK_SEASON,
    MOCK_TEAM_NAMES,
    MOCK_TEAM_SHORT_NAMES,
} from '../data/fixture.data';

describe('Fixture Service', () => {
    // Spy on functions
    let getCurrentEventSpy: ReturnType<typeof spyOn>;
    let getNextEventSpy: ReturnType<typeof spyOn>;
    let getCurrentSeasonSpy: ReturnType<typeof spyOn>;
    let getFromCacheSpy: ReturnType<typeof spyOn>;
    let setToCacheSpy: ReturnType<typeof spyOn>;
    let smembersSpy: ReturnType<typeof spyOn>;
    let hgetallSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
        // Mock event utils
        getCurrentEventSpy = spyOn(
            eventUtils,
            'getCurrentEvent',
        ).mockResolvedValue(MOCK_CURRENT_EVENT);
        getNextEventSpy = spyOn(eventUtils, 'getNextEvent').mockResolvedValue(
            MOCK_NEXT_EVENT,
        );
        getCurrentSeasonSpy = spyOn(
            eventUtils,
            'getCurrentSeason',
        ).mockReturnValue(MOCK_SEASON);

        // Mock cache operations
        getFromCacheSpy = spyOn(cacheUtils, 'getFromCache').mockImplementation(
            async () => null,
        );
        setToCacheSpy = spyOn(cacheUtils, 'setToCache').mockImplementation(
            async () => {},
        );

        // Mock Redis operations
        smembersSpy = spyOn(dataRedis, 'smembers').mockImplementation(
            async (key: string): Promise<string[]> => {
                if (
                    key ===
                    eventKeys.eventFixtures(MOCK_SEASON, MOCK_NEXT_EVENT)
                ) {
                    return MOCK_FIXTURES.map((fixture: Fixture) =>
                        JSON.stringify([
                            'com.tong.fpl.domain.letletme.fixture.FixtureData',
                            {
                                id: fixture.id,
                                event: fixture.event,
                                teamH: fixture.team_h,
                                teamA: fixture.team_a,
                                teamHScore: fixture.team_h_score,
                                teamAScore: fixture.team_a_score,
                                kickoffTime: fixture.kickoff_time,
                                started: fixture.started,
                                finished: fixture.finished,
                                teamHDifficulty: fixture.difficulty,
                            },
                        ]),
                    );
                }
                return [];
            },
        );

        hgetallSpy = spyOn(dataRedis, 'hgetall').mockImplementation(
            async (key: string): Promise<Record<string, string>> => {
                if (key === teamKeys.teamNames(MOCK_SEASON)) {
                    return MOCK_TEAM_NAMES;
                }
                if (key === teamKeys.teamShortNames(MOCK_SEASON)) {
                    return MOCK_TEAM_SHORT_NAMES;
                }
                return {};
            },
        );
    });

    afterEach(() => {
        // Restore original implementations
        getCurrentEventSpy.mockRestore();
        getNextEventSpy.mockRestore();
        getCurrentSeasonSpy.mockRestore();
        getFromCacheSpy.mockRestore();
        setToCacheSpy.mockRestore();
        smembersSpy.mockRestore();
        hgetallSpy.mockRestore();
    });

    describe('getNextGameweekFixtures', () => {
        it('should return next gameweek fixtures with team names', async () => {
            const result = await fixtureService.getNextGameweekFixtures();
            expect(result).toEqual(EXPECTED_NEXT_GAMEWEEK_FIXTURES);
            expect(getCurrentEventSpy).toHaveBeenCalledTimes(1);
            expect(getNextEventSpy).toHaveBeenCalledWith(MOCK_CURRENT_EVENT);
            expect(smembersSpy).toHaveBeenCalledWith(
                eventKeys.eventFixtures(MOCK_SEASON, MOCK_NEXT_EVENT),
            );
            expect(hgetallSpy).toHaveBeenCalledWith(
                teamKeys.teamNames(MOCK_SEASON),
            );
            expect(hgetallSpy).toHaveBeenCalledWith(
                teamKeys.teamShortNames(MOCK_SEASON),
            );
        });

        it('should return cached fixtures if available', async () => {
            getFromCacheSpy.mockResolvedValueOnce(
                EXPECTED_NEXT_GAMEWEEK_FIXTURES,
            );
            const result = await fixtureService.getNextGameweekFixtures();
            expect(result).toEqual(EXPECTED_NEXT_GAMEWEEK_FIXTURES);
            expect(getCurrentEventSpy).not.toHaveBeenCalled();
            expect(smembersSpy).not.toHaveBeenCalled();
        });

        it('should return empty array when current event is not found', async () => {
            getCurrentEventSpy.mockResolvedValueOnce(null);
            const result = await fixtureService.getNextGameweekFixtures();
            expect(result).toEqual([]);
            expect(getNextEventSpy).not.toHaveBeenCalled();
            expect(smembersSpy).not.toHaveBeenCalled();
        });

        it('should return empty array when next event is not found', async () => {
            getNextEventSpy.mockResolvedValueOnce(null);
            const result = await fixtureService.getNextGameweekFixtures();
            expect(result).toEqual([]);
            expect(smembersSpy).not.toHaveBeenCalled();
        });

        it('should return empty array when no fixtures found', async () => {
            smembersSpy.mockResolvedValueOnce([]);
            const result = await fixtureService.getNextGameweekFixtures();
            expect(result).toEqual([]);
            expect(hgetallSpy).not.toHaveBeenCalled();
        });

        it('should handle invalid fixture JSON data', async () => {
            smembersSpy.mockResolvedValueOnce([
                'invalid-json',
                JSON.stringify({ not: 'java-format' }),
                JSON.stringify([
                    'com.tong.fpl.domain.letletme.fixture.FixtureData',
                ]), // Missing data
                JSON.stringify([
                    'com.tong.fpl.domain.letletme.fixture.FixtureData',
                    null,
                ]), // Null data
            ]);
            const result = await fixtureService.getNextGameweekFixtures();
            expect(result).toEqual([]);
        });

        it('should skip fixtures with missing team names', async () => {
            // Mock missing team names
            hgetallSpy.mockImplementation(async () => ({}));
            const result = await fixtureService.getNextGameweekFixtures();
            expect(result).toEqual([]);
        });
    });
});
