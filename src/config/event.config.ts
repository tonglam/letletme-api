/**
 * Event configuration
 */
export const eventConfig = {
    cache: {
        ttl: 60 * 15, // 15 minutes
        key: 'EventService::CurrentEventAndDeadline',
        averageScoresKey: 'EventService::AverageScores',
        averageScoresTtl: 60 * 60, // 1 hour
    },
    season: {
        startMonth: 8, // August
    },
    redis: {
        keyPrefix: 'EventEntity::',
        overallResultPrefix: 'EventOverallResult::',
    },
} as const;
