import { t } from 'elysia';

/**
 * League information schema
 * Basic league information
 */
export const LeagueInfoData = t.Object({
    id: t.Number(),
    name: t.String(),
    season: t.String(),
});

/**
 * League details schema
 * Extended league information
 */
export const LeagueDetailsData = t.Object({
    id: t.String(),
    name: t.String(),
    shortName: t.String(),
    country: t.String(),
    logo: t.String(),
    season: t.String(),
    startDate: t.String(),
    endDate: t.String(),
    currentMatchday: t.Number(),
    totalMatchdays: t.Number(),
    teams: t.Number(),
});

// Export TypeScript types
export type LeagueInfoData = typeof LeagueInfoData.static;
export type LeagueDetailsData = typeof LeagueDetailsData.static;
