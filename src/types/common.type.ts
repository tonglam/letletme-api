import { t } from 'elysia';

export const TeamData = t.Object({
    id: t.Number(),
    name: t.String(),
    shortName: t.String(),
    strength: t.Number(),
});

export const LeagueInfoData = t.Object({
    id: t.Number(),
    name: t.String(),
    season: t.String(),
});

export const PlayerFixtureData = t.Object({
    id: t.Number(),
    event: t.Number(),
    homeTeam: t.String(),
    awayTeam: t.String(),
    kickoffTime: t.String(),
});

// Define EventDeadline schema
export const EventDeadline = t.Object({
    currentEvent: t.String(),
    nextDeadline: t.String(),
});

// Define EventScores schema
export const EventScores = t.Record(t.String(), t.Number());

// Export types
export type TeamData = typeof TeamData.static;
export type LeagueInfoData = typeof LeagueInfoData.static;
export type PlayerFixtureData = typeof PlayerFixtureData.static;
export type EventDeadline = typeof EventDeadline.static;
export type EventScores = typeof EventScores.static;
