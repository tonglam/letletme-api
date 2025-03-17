/**
 * Event Service
 * Provides functionality for event-related operations using a functional approach
 */
import { redis } from '../redis';
import type { EventDeadline, EventScores } from '../types/event.type';
import {
    createCachedFunction,
    determineCurrentEventAndDeadline,
    eventKeys,
    getCurrentSeason,
    getEventDeadlinesFromRedis,
} from '../utils';

/**
 * Get current event and next UTC deadline implementation
 */
const getCurrentEventAndDeadlineImpl = async (): Promise<EventDeadline> => {
    try {
        // Get current season
        const season = getCurrentSeason(new Date());

        // Get event deadlines from Redis
        const redisKey = eventKeys.eventDeadlines(season);
        const eventDeadlines = await getEventDeadlinesFromRedis(redisKey);

        // Determine current event and deadline
        return determineCurrentEventAndDeadline(new Date(), eventDeadlines);
    } catch (error) {
        console.error('Failed to get current event and deadline:', error);
        throw error;
    }
};

/**
 * Get event average scores implementation
 */
const getEventAverageScoresImpl = async (): Promise<EventScores> => {
    try {
        // Get current season
        const season = getCurrentSeason(new Date());

        // Get average scores from Redis
        const scoresKey = eventKeys.averageScores(season);
        const averageScores = await redis.getJson<EventScores>(scoresKey);

        if (!averageScores || Object.keys(averageScores).length === 0) {
            throw new Error('Average scores not found in Redis');
        }

        return averageScores;
    } catch (error) {
        console.error('Failed to get event average scores:', error);
        throw error;
    }
};

// Create cached versions of the functions
export const getCurrentEventAndDeadline = createCachedFunction(
    'events',
    'current-with-deadline',
    getCurrentEventAndDeadlineImpl,
);

export const getEventAverageScores = createCachedFunction(
    'events',
    'average-scores',
    getEventAverageScoresImpl,
);
