/**
 * Redis Key Generator
 * Centralized utility for generating consistent Redis keys across services
 */

/**
 * Service names for type safety
 */
export const ServiceName = {
    EVENT: 'event',
    FIXTURE: 'fixture',
    TEAM: 'team',
    PLAYER: 'player',
    LEAGUE: 'league',
    ENTRY: 'entry',
    SUMMARY: 'summary',
    LIVE: 'live',
    TOURNAMENT: 'tournament',
    STATISTIC: 'statistic',
    NOTICE: 'notice',
    SYSTEM: 'system',
} as const;

export type ServiceName = (typeof ServiceName)[keyof typeof ServiceName];

/**
 * Base key generator with service prefix
 */
const generateKey = (
    service: ServiceName,
    ...parts: (string | number)[]
): string => {
    return [service, ...parts].join(':');
};

/**
 * Event keys
 */
export const eventKeys = {
    currentEvent: (): string => generateKey(ServiceName.EVENT, 'current'),
    eventDeadlines: (season: string | number): string =>
        generateKey(ServiceName.EVENT, 'deadlines', season),
    averageScores: (season: string | number): string =>
        generateKey(ServiceName.EVENT, 'average-scores', season),
    eventInfo: (eventId: string | number): string =>
        generateKey(ServiceName.EVENT, 'info', eventId),
};

/**
 * Fixture keys
 */
export const fixtureKeys = {
    eventFixtures: (eventId: string | number): string =>
        generateKey(ServiceName.FIXTURE, 'event', eventId),
    fixtureInfo: (fixtureId: string | number): string =>
        generateKey(ServiceName.FIXTURE, 'info', fixtureId),
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
        generateKey(ServiceName.TEAM, 'names', season),
    teamShortNames: (season: string | number): string =>
        generateKey(ServiceName.TEAM, 'short-names', season),
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
    ): string => generateKey(ServiceName.PLAYER, 'stats', playerId, eventId),
    playerHistory: (playerId: string | number): string =>
        generateKey(ServiceName.PLAYER, 'history', playerId),
};

/**
 * League keys
 */
export const leagueKeys = {
    leagueInfo: (leagueId: string | number): string =>
        generateKey(ServiceName.LEAGUE, 'info', leagueId),
    leagueStandings: (leagueId: string | number): string =>
        generateKey(ServiceName.LEAGUE, 'standings', leagueId),
};

/**
 * Entry keys
 */
export const entryKeys = {
    entryInfo: (entryId: string | number): string =>
        generateKey(ServiceName.ENTRY, 'info', entryId),
    entryHistory: (entryId: string | number): string =>
        generateKey(ServiceName.ENTRY, 'history', entryId),
    entryPicks: (entryId: string | number, eventId: string | number): string =>
        generateKey(ServiceName.ENTRY, 'picks', entryId, eventId),
};

/**
 * Summary keys
 */
export const summaryKeys = {
    gameweekSummary: (eventId: string | number): string =>
        generateKey(ServiceName.SUMMARY, 'gameweek', eventId),
    overallSummary: (): string => generateKey(ServiceName.SUMMARY, 'overall'),
};

/**
 * Live keys
 */
export const liveKeys = {
    liveScores: (eventId: string | number): string =>
        generateKey(ServiceName.LIVE, 'scores', eventId),
    liveBonus: (eventId: string | number): string =>
        generateKey(ServiceName.LIVE, 'bonus', eventId),
};

/**
 * Tournament keys
 */
export const tournamentKeys = {
    tournamentInfo: (tournamentId: string | number): string =>
        generateKey(ServiceName.TOURNAMENT, 'info', tournamentId),
    tournamentStandings: (tournamentId: string | number): string =>
        generateKey(ServiceName.TOURNAMENT, 'standings', tournamentId),
};

/**
 * Statistic keys
 */
export const statisticKeys = {
    playerStats: (playerId: string | number): string =>
        generateKey(ServiceName.STATISTIC, 'player', playerId),
    teamStats: (teamId: string | number): string =>
        generateKey(ServiceName.STATISTIC, 'team', teamId),
};

/**
 * Notice keys
 */
export const noticeKeys = {
    allNotices: (): string => generateKey(ServiceName.NOTICE, 'all'),
    noticeInfo: (noticeId: string | number): string =>
        generateKey(ServiceName.NOTICE, 'info', noticeId),
};

/**
 * System keys
 */
export const systemKeys = {
    config: (key: string): string =>
        generateKey(ServiceName.SYSTEM, 'config', key),
    status: (): string => generateKey(ServiceName.SYSTEM, 'status'),
};
