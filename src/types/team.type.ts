import { t } from 'elysia';

/**
 * Team data schema
 * Basic team information
 */
export const TeamData = t.Object({
    id: t.Number(),
    name: t.String(),
    shortName: t.String(),
    strength: t.Number(),
});

/**
 * Team details schema
 * Extended team information including venue, coach, and squad
 */
export const TeamDetailsData = t.Object({
    id: t.String(),
    name: t.String(),
    shortName: t.String(),
    logo: t.String(),
    country: t.String(),
    founded: t.Number(),
    venue: t.Object({
        name: t.String(),
        address: t.String(),
        city: t.String(),
        capacity: t.Number(),
        surface: t.String(),
        image: t.String(),
    }),
    leagueId: t.String(),
    leagueName: t.String(),
});

// Export TypeScript types
export type TeamData = typeof TeamData.static;
export type TeamDetailsData = typeof TeamDetailsData.static;
