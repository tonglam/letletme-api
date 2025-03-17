/**
 * Cache Key Utilities
 * Manages cache keys separately from data keys
 */

/**
 * Cache namespaces for different resources
 */
export const CacheNamespace = {
    EVENT: 'events',
    FIXTURE: 'fixtures',
    TEAM: 'teams',
    PLAYER: 'players',
    LEAGUE: 'leagues',
    ENTRY: 'entries',
    SUMMARY: 'summaries',
} as const;

export type CacheNamespace =
    (typeof CacheNamespace)[keyof typeof CacheNamespace];

/**
 * Generate a cache key with proper namespacing
 * Format: api:{namespace}:{resource}
 */
const generateCacheKey = (
    namespace: CacheNamespace,
    resource: string,
): string => {
    return `api:${namespace}:${resource}`;
};

/**
 * Event cache keys
 */
export const eventCacheKeys = {
    currentWithDeadline: (): string =>
        generateCacheKey(CacheNamespace.EVENT, 'current-with-deadline'),
    eventDeadlines: (season: string | number): string =>
        generateCacheKey(CacheNamespace.EVENT, `deadlines:${season}`),
    eventScores: (season: string | number): string =>
        generateCacheKey(CacheNamespace.EVENT, `scores:${season}`),
};

/**
 * Fixture cache keys
 */
export const fixtureCacheKeys = {
    nextGameweek: (): string =>
        generateCacheKey(CacheNamespace.FIXTURE, 'next-gameweek'),
    fixturesByEvent: (eventId: string | number): string =>
        generateCacheKey(CacheNamespace.FIXTURE, `event:${eventId}`),
};

/**
 * Team cache keys
 */
export const teamCacheKeys = {
    allTeams: (season: string | number): string =>
        generateCacheKey(CacheNamespace.TEAM, `all-teams:${season}`),
    teamInfo: (teamId: string | number): string =>
        generateCacheKey(CacheNamespace.TEAM, `team:${teamId}`),
};

/**
 * Player cache keys
 */
export const playerCacheKeys = {
    playerInfo: (playerId: string | number): string =>
        generateCacheKey(CacheNamespace.PLAYER, `player:${playerId}`),
    playerStats: (
        playerId: string | number,
        eventId: string | number,
    ): string =>
        generateCacheKey(
            CacheNamespace.PLAYER,
            `player:${playerId}:event:${eventId}`,
        ),
};

/**
 * League cache keys
 */
export const leagueCacheKeys = {
    leagueInfo: (leagueId: string | number): string =>
        generateCacheKey(CacheNamespace.LEAGUE, `league:${leagueId}`),
    standings: (leagueId: string | number): string =>
        generateCacheKey(CacheNamespace.LEAGUE, `standings:${leagueId}`),
};

/**
 * Entry cache keys
 */
export const entryCacheKeys = {
    entryInfo: (entryId: string | number): string =>
        generateCacheKey(CacheNamespace.ENTRY, `entry:${entryId}`),
    entryHistory: (entryId: string | number): string =>
        generateCacheKey(CacheNamespace.ENTRY, `history:${entryId}`),
};

/**
 * Summary cache keys
 */
export const summaryCacheKeys = {
    gameweekSummary: (eventId: string | number): string =>
        generateCacheKey(CacheNamespace.SUMMARY, `gameweek:${eventId}`),
    overallSummary: (): string =>
        generateCacheKey(CacheNamespace.SUMMARY, 'overall'),
};
