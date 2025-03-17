/**
 * Event configuration
 */
export const eventConfig = {
    cache: {
        ttl: 60 * 60, // 1 hour
        key: 'fpl:event:current',
        averageScoresKey: 'EventService::AverageScores',
        averageScoresTtl: 60 * 60, // 1 hour
    },
    season: {
        startMonth: 8, // August
        totalEvents: 38, // Premier League has 38 gameweeks
    },
    redis: {
        keyPrefix: 'EventEntity::',
        overallResultPrefix: 'EventOverallResult::',
    },
} as const;
