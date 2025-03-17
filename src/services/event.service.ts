/**
 * Event Service
 * Provides functionality for event-related operations using a functional approach
 */
import { logger } from '../config/logger.config';
import { dataRedis } from '../redis';
import type {
    EventDeadline,
    EventDeadlines,
    EventScores,
} from '../types/event.type';
import {
    createCachedFunction,
    determineCurrentEventAndDeadline,
    eventKeys,
    getCurrentSeason,
} from '../utils';
import { ServiceName } from '../utils/redis-key.utils';

/**
 * Get event deadlines from Redis hash
 * @param redisKey - Redis key for event deadlines
 * @returns Object mapping event IDs to deadlines
 */
const getEventDeadlinesFromRedis = async (
    redisKey: string,
): Promise<EventDeadlines> => {
    try {
        logger.info({ redisKey }, 'Fetching event deadlines from Redis');

        // Test Redis connection
        try {
            const pingResult = await dataRedis.ping();
            logger.info({ pingResult }, 'Redis ping result');
        } catch (pingErr) {
            logger.error({ pingErr }, 'Redis ping failed');
        }

        // Get all fields from the hash
        try {
            const deadlines = await dataRedis.hgetall(redisKey);
            logger.info(
                {
                    hasDeadlines: !!deadlines,
                    keyCount: Object.keys(deadlines || {}).length,
                    redisKey,
                },
                'Redis response for deadlines',
            );

            if (!deadlines || Object.keys(deadlines).length === 0) {
                throw new Error('Event deadlines not found in Redis');
            }

            // Convert to EventDeadlines format and parse JSON strings
            const deadlineMap: EventDeadlines = {};
            for (const [eventId, deadline] of Object.entries(deadlines)) {
                deadlineMap[eventId] = JSON.parse(deadline);
            }

            return deadlineMap;
        } catch (hgetallErr) {
            logger.error({ hgetallErr }, 'Redis hgetall failed');
            throw hgetallErr;
        }
    } catch (err) {
        logger.error(
            { err, redisKey },
            'Failed to get event deadlines from Redis',
        );
        throw err;
    }
};

/**
 * Get current event and next UTC deadline implementation
 */
const getCurrentEventAndDeadlineImpl = async (): Promise<EventDeadline> => {
    try {
        // Get current season
        const season = getCurrentSeason(new Date());
        logger.info({ season }, 'Current season');

        // Get event deadlines from Redis
        const redisKey = eventKeys.eventDeadlines(season);
        logger.info({ redisKey }, 'Redis key for event deadlines');

        const eventDeadlines = await getEventDeadlinesFromRedis(redisKey);

        // Determine current event and deadline
        const result = determineCurrentEventAndDeadline(
            new Date(),
            eventDeadlines,
        );
        logger.info({ result }, 'Determined current event and deadline');

        return result;
    } catch (err) {
        logger.error({ err }, 'Failed to get current event and deadline');
        throw err;
    }
};

/**
 * Get event average scores implementation
 */
const getEventAverageScoresImpl = async (): Promise<EventScores> => {
    try {
        // Get current season
        const season = getCurrentSeason(new Date());
        logger.info({ season }, 'Current season for average scores');

        // Get overall results from Redis
        const resultsKey = eventKeys.eventOverallResult(season);
        logger.info({ resultsKey }, 'Redis key for event overall results');

        // Get all fields from the hash
        const results = await dataRedis.hgetall(resultsKey);
        logger.info(
            {
                hasResults: !!results,
                keyCount: Object.keys(results || {}).length,
            },
            'Redis response for overall results',
        );

        if (!results || Object.keys(results).length === 0) {
            throw new Error('Event overall results not found in Redis');
        }

        // Convert to EventScores format and extract averageEntryScore from the complex Java objects
        const scores: { [event: string]: number } = {};
        for (const [eventId, resultJson] of Object.entries(results)) {
            try {
                // Parse the Java object JSON string
                const parsedJson = JSON.parse(resultJson);

                // The second element in the array contains the actual data
                if (
                    Array.isArray(parsedJson) &&
                    parsedJson.length > 1 &&
                    parsedJson[1]
                ) {
                    const resultData = parsedJson[1];
                    // Extract the averageEntryScore
                    if (resultData.averageEntryScore !== undefined) {
                        scores[eventId] = resultData.averageEntryScore;
                    }
                }
            } catch (parseErr) {
                logger.error(
                    { parseErr, eventId, resultJson },
                    'Failed to parse event result JSON',
                );
            }
        }

        return { scores };
    } catch (err) {
        logger.error({ err }, 'Failed to get event average scores');
        throw err;
    }
};

// Create cached versions of the functions
export const getCurrentEventAndDeadline = createCachedFunction(
    ServiceName.EVENT,
    'current-with-deadline',
    getCurrentEventAndDeadlineImpl,
);

// Export the average scores function directly without caching
export const getEventAverageScores = getEventAverageScoresImpl;
