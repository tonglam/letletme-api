/**
 * Event Service
 * Provides functionality for event-related operations using a functional approach
 */
import { eventConfig } from '../config/event';
import { redis } from '../redis';
import type { EventDeadline, EventScores } from '../types/event.type';
import {
    cacheOperations,
    determineCurrentEventAndDeadline,
    getCurrentSeason,
    getEventDeadlinesFromRedis,
} from '../utils';

/**
 * Get current event and next UTC deadline
 */
export const getCurrentEventAndDeadline = async (): Promise<EventDeadline> => {
    try {
        // Check cache first
        const cachedData = await cacheOperations.get();

        if (cachedData) {
            return cachedData;
        }

        // Calculate current season and get data from Redis
        const now = new Date();
        const season = getCurrentSeason(now);
        const redisKey = `${eventConfig.redis.keyPrefix}${season}`;

        // Get events from Redis
        const events = await getEventDeadlinesFromRedis(redisKey);

        // Determine current event and deadline
        const result = determineCurrentEventAndDeadline(now, events);

        // Cache the result
        await cacheOperations.set(result);

        return result;
    } catch (error) {
        throw new Error(`Failed to get current event and deadline: ${error}`);
    }
};

/**
 * Get event average scores
 */
export const getEventAverageScores = async (): Promise<EventScores> => {
    try {
        // Check cache first
        const cachedScores = await redis.getJson<EventScores>(
            eventConfig.cache.averageScoresKey,
        );

        if (cachedScores) {
            return cachedScores;
        }

        // Get current season
        const now = new Date();
        const season = getCurrentSeason(now);

        // Fetch data from Redis
        const redisKey = `${eventConfig.redis.overallResultPrefix}${season}`;
        const client = redis.getClient();
        const eventData = await client.hgetall(redisKey);

        if (!eventData || Object.keys(eventData).length === 0) {
            throw new Error(`No event data found for key: ${redisKey}`);
        }

        // Extract average scores from event data
        const averageScores: Record<string, number> = {};

        for (const [event, data] of Object.entries(eventData)) {
            try {
                // Ensure data is a string before parsing
                const dataStr = String(data);
                const parsedData = JSON.parse(dataStr);
                if (
                    parsedData &&
                    typeof parsedData.averageEntryScore === 'number'
                ) {
                    averageScores[event] = parsedData.averageEntryScore;
                }
            } catch (parseError) {
                console.error(
                    `Error parsing data for event ${event}: ${parseError}`,
                );
                // Continue with other events even if one fails to parse
            }
        }

        // Cache the result
        await redis.setJson(
            eventConfig.cache.averageScoresKey,
            averageScores,
            eventConfig.cache.averageScoresTtl,
        );

        return averageScores;
    } catch (error) {
        throw new Error(`Failed to get event average scores: ${error}`);
    }
};

/**
 * Refresh event and deadline information
 */
export const refreshEventAndDeadline = async (): Promise<void> => {
    try {
        await cacheOperations.clear();
    } catch (error) {
        throw new Error(`Failed to refresh event and deadline: ${error}`);
    }
};

/**
 * Refresh event average scores cache
 */
export const refreshEventAverageScores = async (): Promise<void> => {
    try {
        await redis.del(eventConfig.cache.averageScoresKey);
    } catch (error) {
        throw new Error(`Failed to refresh event average scores: ${error}`);
    }
};

/**
 * Insert event live cache
 */
export const insertEventLiveCache = async (eventId: number): Promise<void> => {
    try {
        // Clear the current event cache to ensure we get fresh data
        await cacheOperations.clear();
        console.log(`Inserting live cache for event ${eventId}`);
        // In a real implementation, this would populate the Redis cache with live data for the event
    } catch (error) {
        throw new Error(`Failed to insert event live cache: ${error}`);
    }
};
