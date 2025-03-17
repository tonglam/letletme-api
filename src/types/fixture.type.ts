import { t } from 'elysia';

/**
 * Base fixture schema
 * Core fixture information used across different contexts
 */
export const Fixture = t.Object({
    id: t.Number(),
    event: t.Number(),
    team_h: t.Number(),
    team_a: t.Number(),
    team_h_score: t.Optional(t.Number()),
    team_a_score: t.Optional(t.Number()),
    team_h_name: t.Optional(t.String()),
    team_a_name: t.Optional(t.String()),
    team_h_short: t.Optional(t.String()),
    team_a_short: t.Optional(t.String()),
    kickoff_time: t.String(),
    started: t.Boolean(),
    finished: t.Boolean(),
    difficulty: t.Optional(t.Number()),
});

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
 * Team information schema
 * Basic team information used in fixtures
 */
export const TeamInfo = t.Object({
    id: t.String(),
    name: t.String(),
    logo: t.String(),
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
    homeTeam: TeamInfo,
    awayTeam: TeamInfo,
    date: t.String(),
    time: t.String(),
    venue: t.String(),
    status: t.String(),
});

/**
 * Next gameweek fixture schema
 * Information about fixtures for the next gameweek
 */
export const NextGameweekFixture = t.Object({
    event: t.Number(),
    teamId: t.Number(),
    teamName: t.String(),
    teamShortName: t.String(),
    againstTeamId: t.Number(),
    againstTeamName: t.String(),
    againstTeamShortName: t.String(),
    difficulty: t.Number(),
    kickoffTime: t.String(),
    started: t.Boolean(),
    finished: t.Boolean(),
    wasHome: t.Boolean(),
    teamScore: t.Number(),
    againstTeamScore: t.Number(),
    score: t.String(),
    result: t.String(),
    bgw: t.Boolean(),
    dgw: t.Boolean(),
});

// Export TypeScript types
export type Fixture = typeof Fixture.static;
export type PlayerFixtureData = typeof PlayerFixtureData.static;
export type MatchScoreData = typeof MatchScoreData.static;
export type TeamInfo = typeof TeamInfo.static;
export type FixtureDetailsData = typeof FixtureDetailsData.static;
export type NextGameweekFixture = typeof NextGameweekFixture.static;
