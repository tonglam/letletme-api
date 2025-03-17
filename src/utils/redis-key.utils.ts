/**
 * Redis Key Generator
 * Centralized utility for generating consistent Redis keys across services
 */

/**
 * Service names for type safety
 */
export const ServiceName = {
    EVENT: 'EventEntity',
    EVENT_FIXTURE: 'EventFixtureEntity',
    EVENT_LIVE: 'EventLiveEntity',
    EVENT_LIVE_EXPLAIN: 'EventLiveExplainEntity',
    TEAM: 'TeamEntity',
    PLAYER: 'PlayerEntity',
    PLAYER_STAT: 'PlayerStatEntity',
    PLAYER_HISTORY: 'PlayerHistoryEntity',
    PLAYER_VALUE: 'PlayerValueEntity',
    STANDING: 'StandingEntity',
    EVENT_OVERALL_RESULT: 'EventOverallResult',
} as const;

export type ServiceName = (typeof ServiceName)[keyof typeof ServiceName];

/**
 * Generate a Redis key with consistent format
 */
const generateKey = (
    service: string,
    ...parts: Array<string | number>
): string => {
    return [service, ...parts].join('::');
};

/**
 * Event keys
 */
export const eventKeys = {
    /**
     * Get current event cache key
     */
    currentEvent: (): string => generateKey(ServiceName.EVENT, 'current'),

    /**
     * Get event deadlines for a season
     * Returns a hash where:
     * - Keys are event numbers (1-38)
     * - Values are deadline timestamps
     */
    eventDeadlines: (season: string | number): string =>
        generateKey(ServiceName.EVENT, season),

    /**
     * Get fixtures for a specific event in a season
     */
    eventFixtures: (
        season: string | number,
        eventId: string | number,
    ): string =>
        generateKey(ServiceName.EVENT_FIXTURE, season, 'event', eventId),

    /**
     * Get live data for an event
     */
    eventLive: (eventId: string | number): string =>
        generateKey(ServiceName.EVENT_LIVE, eventId),

    /**
     * Get live explanations for an event
     */
    eventLiveExplain: (eventId: string | number): string =>
        generateKey(ServiceName.EVENT_LIVE_EXPLAIN, eventId),

    /**
     * Get overall results for a season
     */
    eventOverallResult: (season: string | number): string =>
        generateKey(ServiceName.EVENT_OVERALL_RESULT, season),

    /**
     * Get average scores for a season
     */
    averageScores: (season: string | number): string =>
        generateKey(ServiceName.EVENT, season, 'averageScores'),
};

/**
 * Fixture keys
 */
export const fixtureKeys = {
    eventFixtures: (eventId: string | number): string =>
        generateKey(ServiceName.EVENT_FIXTURE, 'event', eventId),
    fixtureInfo: (fixtureId: string | number): string =>
        generateKey(ServiceName.EVENT_FIXTURE, 'info', fixtureId),
};

/**
 * Team keys
 */
export const teamKeys = {
    allTeams: (season: string | number): string =>
        generateKey(ServiceName.TEAM, 'all', season),
    teamInfo: (teamId: string | number): string =>
        generateKey(ServiceName.TEAM, 'info', teamId),
    teamNames: (season: string | number): string =>
        generateKey(ServiceName.TEAM, season, 'name'),
    teamShortNames: (season: string | number): string =>
        generateKey(ServiceName.TEAM, season, 'shortName'),
};

/**
 * Player keys
 */
export const playerKeys = {
    playerInfo: (playerId: string | number): string =>
        generateKey(ServiceName.PLAYER, 'info', playerId),
    playerStats: (
        playerId: string | number,
        eventId: string | number,
    ): string => generateKey(ServiceName.PLAYER_STAT, playerId, eventId),
    playerHistory: (playerId: string | number): string =>
        generateKey(ServiceName.PLAYER_HISTORY, playerId),
};

/**
 * League keys
 */
export const leagueKeys = {
    leagueInfo: (leagueId: string | number): string =>
        generateKey(ServiceName.STANDING, 'info', leagueId),
    leagueStandings: (leagueId: string | number): string =>
        generateKey(ServiceName.STANDING, 'standings', leagueId),
};

/**
 * Entry keys
 */
export const entryKeys = {
    entryInfo: (entryId: string | number): string =>
        generateKey(ServiceName.PLAYER_VALUE, 'info', entryId),
    entryHistory: (entryId: string | number): string =>
        generateKey(ServiceName.PLAYER_HISTORY, 'history', entryId),
    entryPicks: (entryId: string | number, eventId: string | number): string =>
        generateKey(ServiceName.PLAYER_VALUE, 'picks', entryId, eventId),
};

/**
 * Summary keys
 */
export const summaryKeys = {
    gameweekSummary: (eventId: string | number): string =>
        generateKey(ServiceName.PLAYER_VALUE, 'gameweek', eventId),
    overallSummary: (): string =>
        generateKey(ServiceName.PLAYER_VALUE, 'overall'),
};

/**
 * Live keys
 */
export const liveKeys = {
    liveScores: (eventId: string | number): string =>
        generateKey(ServiceName.EVENT_LIVE, 'scores', eventId),
    liveBonus: (eventId: string | number): string =>
        generateKey(ServiceName.EVENT_LIVE, 'bonus', eventId),
};

/**
 * Tournament keys
 */
export const tournamentKeys = {
    tournamentInfo: (tournamentId: string | number): string =>
        generateKey(ServiceName.STANDING, 'info', tournamentId),
    tournamentStandings: (tournamentId: string | number): string =>
        generateKey(ServiceName.STANDING, 'standings', tournamentId),
};

/**
 * Statistic keys
 */
export const statisticKeys = {
    playerStats: (playerId: string | number): string =>
        generateKey(ServiceName.PLAYER_STAT, playerId),
    teamStats: (teamId: string | number): string =>
        generateKey(ServiceName.STANDING, 'team', teamId),
};

/**
 * Notice keys
 */
export const noticeKeys = {
    allNotices: (): string => generateKey(ServiceName.PLAYER_VALUE, 'all'),
    noticeInfo: (noticeId: string | number): string =>
        generateKey(ServiceName.PLAYER_VALUE, 'info', noticeId),
};

/**
 * System keys
 */
export const systemKeys = {
    config: (key: string): string =>
        generateKey(ServiceName.PLAYER_VALUE, 'config', key),
    status: (): string => generateKey(ServiceName.PLAYER_VALUE, 'status'),
};
