import { t } from 'elysia';

/**
 * Player fixture data schema
 * Information about a fixture for a player
 */
export const PlayerFixtureData = t.Object({
    id: t.Number(),
    event: t.Number(),
    homeTeam: t.String(),
    awayTeam: t.String(),
    kickoffTime: t.String(),
});

/**
 * Match score schema
 * Score information for a match
 */
export const MatchScoreData = t.Object({
    home: t.Union([t.Number(), t.Null()]),
    away: t.Union([t.Number(), t.Null()]),
});

/**
 * Fixture details schema
 * Detailed information about a fixture
 */
export const FixtureDetailsData = t.Object({
    id: t.String(),
    eventId: t.Number(),
    leagueId: t.String(),
    leagueName: t.String(),
    round: t.String(),
    homeTeam: t.Object({
        id: t.String(),
        name: t.String(),
        logo: t.String(),
    }),
    awayTeam: t.Object({
        id: t.String(),
        name: t.String(),
        logo: t.String(),
    }),
    date: t.String(),
    time: t.String(),
    venue: t.String(),
    status: t.String(),
});

// Export TypeScript types
export type PlayerFixtureData = typeof PlayerFixtureData.static;
export type MatchScoreData = typeof MatchScoreData.static;
export type FixtureDetailsData = typeof FixtureDetailsData.static;
