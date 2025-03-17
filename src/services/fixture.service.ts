/**
 * Fixture Service
 * Handles fixture-related operations using a functional approach
 */
import { logger } from '../config/logger.config';
import { dataRedis } from '../redis';
import type { Fixture, NextGameweekFixture } from '../types/fixture.type';
import { createCachedFunction } from '../utils/cache.utils';
import {
    getCurrentEvent,
    getCurrentSeason,
    getNextEvent,
} from '../utils/event.utils';
import { ServiceName, eventKeys } from '../utils/redis-key.utils';
import { getTeamNames } from '../utils/team.utils';

/**
 * Get fixtures for the next gameweek
 */
const getNextGameweekFixturesImpl = async (): Promise<
    NextGameweekFixture[]
> => {
    // Get current event and season
    const currentEvent = await getCurrentEvent();
    logger.info({ currentEvent }, 'Current event from getCurrentEvent');
    if (!currentEvent) {
        logger.warn('Current event not found');
        return [];
    }

    // Calculate next event
    const nextEvent = await getNextEvent(currentEvent);
    logger.info({ nextEvent }, 'Next event calculated');
    if (!nextEvent) {
        logger.warn('Next event not found');
        return [];
    }

    // Get fixtures from Redis using the correct key format
    const season = getCurrentSeason();
    const fixtureKey = eventKeys.eventFixtures(season, nextEvent);
    logger.info({ fixtureKey, season }, 'Fixture key generated');

    // Get all members from the set
    const fixturesSet = await dataRedis.smembers(fixtureKey);
    logger.info({ fixturesSet }, 'Fixtures set from Redis');
    if (!fixturesSet || fixturesSet.length === 0) {
        logger.warn({ fixtureKey }, 'No fixtures found in Redis');
        return [];
    }

    // Get team names using the utility function
    const teamNames = await getTeamNames();
    logger.info({ teamNames }, 'Team names from Redis');

    // Parse the fixtures from the set
    const fixtures: Fixture[] = [];
    for (const fixtureJson of fixturesSet) {
        try {
            const parsed = JSON.parse(fixtureJson);
            logger.info({ parsed }, 'Parsed fixture JSON');
            // Handle Java object format
            if (Array.isArray(parsed) && parsed.length > 1 && parsed[1]) {
                const javaObject = parsed[1];
                logger.info({ javaObject }, 'Java object from parsed fixture');
                // Map Java object to our Fixture type
                const fixture: Fixture = {
                    id: javaObject.id,
                    event: javaObject.event,
                    team_h: javaObject.teamH,
                    team_a: javaObject.teamA,
                    team_h_score: javaObject.teamHScore,
                    team_a_score: javaObject.teamAScore,
                    kickoff_time: javaObject.kickoffTime,
                    started: javaObject.started,
                    finished: javaObject.finished,
                    difficulty: javaObject.teamHDifficulty, // Use home team difficulty as default
                };
                logger.info({ fixture }, 'Mapped fixture');
                fixtures.push(fixture);
            }
        } catch (parseErr) {
            logger.error(
                { parseErr, fixtureJson },
                'Failed to parse fixture JSON',
            );
        }
    }
    logger.info({ fixtures }, 'Parsed fixtures');

    // Transform fixtures to NextGameweekFixture format
    const nextGameweekFixtures = fixtures.flatMap(
        (fixture): NextGameweekFixture[] => {
            const homeTeamId = fixture.team_h.toString();
            const awayTeamId = fixture.team_a.toString();
            const homeTeamName = teamNames[homeTeamId];
            const awayTeamName = teamNames[awayTeamId];
            const homeTeamShort = teamNames[`${homeTeamId}_short`];
            const awayTeamShort = teamNames[`${awayTeamId}_short`];

            logger.info(
                {
                    fixture,
                    homeTeamId,
                    awayTeamId,
                    homeTeamName,
                    awayTeamName,
                    homeTeamShort,
                    awayTeamShort,
                },
                'Team names for fixture',
            );

            // Skip fixtures where we don't have team names
            if (
                !homeTeamName ||
                !awayTeamName ||
                !homeTeamShort ||
                !awayTeamShort
            ) {
                logger.warn(
                    {
                        fixture,
                        homeTeamId,
                        awayTeamId,
                        homeTeamName,
                        awayTeamName,
                        homeTeamShort,
                        awayTeamShort,
                    },
                    'Missing team names for fixture',
                );
                return [];
            }

            // Create home team fixture
            const homeFixture: NextGameweekFixture = {
                event: fixture.event,
                teamId: fixture.team_h,
                teamName: homeTeamName,
                teamShortName: homeTeamShort,
                againstTeamId: fixture.team_a,
                againstTeamName: awayTeamName,
                againstTeamShortName: awayTeamShort,
                difficulty: fixture.difficulty || 0,
                kickoffTime: fixture.kickoff_time,
                started: fixture.started,
                finished: fixture.finished,
                wasHome: true,
                teamScore: fixture.team_h_score || 0,
                againstTeamScore: fixture.team_a_score || 0,
                score: `${fixture.team_h_score || 0}-${fixture.team_a_score || 0}`,
                result: getResult(fixture.team_h_score, fixture.team_a_score),
                bgw: false,
                dgw: false,
            };

            // Create away team fixture
            const awayFixture: NextGameweekFixture = {
                event: fixture.event,
                teamId: fixture.team_a,
                teamName: awayTeamName,
                teamShortName: awayTeamShort,
                againstTeamId: fixture.team_h,
                againstTeamName: homeTeamName,
                againstTeamShortName: homeTeamShort,
                difficulty: fixture.difficulty || 0,
                kickoffTime: fixture.kickoff_time,
                started: fixture.started,
                finished: fixture.finished,
                wasHome: false,
                teamScore: fixture.team_a_score || 0,
                againstTeamScore: fixture.team_h_score || 0,
                score: `${fixture.team_a_score || 0}-${fixture.team_h_score || 0}`,
                result: getResult(fixture.team_a_score, fixture.team_h_score),
                bgw: false,
                dgw: false,
            };

            logger.info({ homeFixture, awayFixture }, 'Created fixtures');
            return [homeFixture, awayFixture];
        },
    );

    logger.info({ nextGameweekFixtures }, 'Final next gameweek fixtures');
    return nextGameweekFixtures;
};

/**
 * Helper function to determine the result of a fixture
 */
const getResult = (
    teamScore: number | undefined | null,
    againstTeamScore: number | undefined | null,
): string => {
    if (
        teamScore === undefined ||
        teamScore === null ||
        againstTeamScore === undefined ||
        againstTeamScore === null
    ) {
        return '';
    }

    if (teamScore > againstTeamScore) {
        return 'W';
    } else if (teamScore < againstTeamScore) {
        return 'L';
    } else {
        return 'D';
    }
};

// Create cached version of the function
export const getNextGameweekFixtures = createCachedFunction(
    ServiceName.EVENT_FIXTURE,
    'next-gameweek',
    getNextGameweekFixturesImpl,
);
