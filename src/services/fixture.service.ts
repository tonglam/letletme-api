/**
 * Fixture Service
 * Handles fixture-related operations using a functional approach
 */
import { redis } from '../redis';
import type { Fixture } from '../types/fixture.type';
import { createCachedFunction } from '../utils/cache.utils';
import { getCurrentEvent, getNextEvent } from '../utils/event.utils';
import { getTeamNames } from '../utils/team.utils';

/**
 * Get fixtures for the next gameweek
 */
const getNextGameweekFixturesImpl = async (): Promise<Fixture[]> => {
    try {
        // Get current event and season
        const currentEvent = await getCurrentEvent();
        if (!currentEvent) {
            throw new Error('Current event not found');
        }

        // Calculate next event
        const nextEvent = await getNextEvent(currentEvent);
        if (!nextEvent) {
            throw new Error('Next event not found');
        }

        // Get fixtures from Redis
        const fixtureKey = `fixtures:${nextEvent}`;
        const fixtures = await redis.getJson<Fixture[]>(fixtureKey);
        if (!fixtures) {
            return [];
        }

        // Get team names
        const teamNames = await getTeamNames();

        // Transform fixtures with team names
        return fixtures.map((fixture) => ({
            ...fixture,
            team_h_name: teamNames[fixture.team_h] || '',
            team_a_name: teamNames[fixture.team_a] || '',
            team_h_short: teamNames[`${fixture.team_h}_short`] || '',
            team_a_short: teamNames[`${fixture.team_a}_short`] || '',
        }));
    } catch (error) {
        console.error('Error getting next gameweek fixtures:', error);
        throw error;
    }
};

// Create cached version of the function
export const getNextGameweekFixtures = createCachedFunction(
    'fixtures',
    'next-gameweek',
    getNextGameweekFixturesImpl,
);
