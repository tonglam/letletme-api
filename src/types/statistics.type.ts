import { t } from 'elysia';

/**
 * Player statistics schema
 * Statistical data for a player
 */
export const PlayerStatisticsData = t.Object({
    playerId: t.String(),
    tournamentId: t.Optional(t.String()),
    totalMatches: t.Number(),
    wins: t.Number(),
    losses: t.Number(),
    winRate: t.Number(),
    averagePointsPerMatch: t.Number(),
    highestScore: t.Number(),
});

/**
 * Tournament statistics schema
 * Statistical data for a tournament
 */
export const TournamentStatisticsData = t.Object({
    tournamentId: t.String(),
    matchesPlayed: t.Number(),
    matchesCompleted: t.Number(),
    matchesInProgress: t.Number(),
    totalPlayers: t.Number(),
    averageMatchDuration: t.Number(),
});

/**
 * Head-to-head statistics schema
 * Statistical data for matches between two players
 */
export const HeadToHeadStatisticsData = t.Object({
    player1Id: t.String(),
    player2Id: t.String(),
    matches: t.Number(),
    player1Wins: t.Number(),
    player2Wins: t.Number(),
    averageScoreDifference: t.Number(),
    averageMatchDuration: t.Number(),
});

// Export TypeScript types
export type PlayerStatisticsData = typeof PlayerStatisticsData.static;
export type TournamentStatisticsData = typeof TournamentStatisticsData.static;
export type HeadToHeadStatisticsData = typeof HeadToHeadStatisticsData.static;
