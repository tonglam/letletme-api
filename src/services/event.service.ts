/**
 * Event Service
 * Provides functionality for event-related operations using a functional approach
 */
import { eventConfig } from '../config/event';
import { redis } from '../redis';
import type { EventDeadline, EventScores } from '../types/event.type';
import { cacheOperations } from '../utils';

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

        // Hardcoded values for current event and deadline as specified
        const event = '29';
        const utcDeadline = '2025-04-01T17:15:00Z';

        // Return hardcoded values
        const result: EventDeadline = {
            event,
            utcDeadline,
        };

        // Cache the result
        await cacheOperations.set(result);

        return result;
    } catch (error) {
        console.error('Failed to get current event and deadline:', error);
        // Return default values in case of error
        return {
            event: '29',
            utcDeadline: '2025-04-01T17:15:00Z',
        };
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

        if (cachedScores && Object.keys(cachedScores).length > 0) {
            return cachedScores;
        }

        // Hardcoded event scores as specified
        const averageScores: Record<string, number> = {
            '1': 57,
            '2': 69,
            '3': 64,
            '4': 51,
            '5': 58,
            '6': 50,
            '7': 46,
            '8': 36,
            '9': 54,
            '10': 39,
            '11': 49,
            '12': 49,
            '13': 60,
            '14': 58,
            '15': 50,
            '16': 47,
            '17': 60,
            '18': 51,
            '19': 66,
            '20': 60,
            '21': 55,
            '22': 46,
            '23': 59,
            '24': 87,
            '25': 74,
            '26': 62,
            '27': 53,
            '28': 52,
            '29': 40,
            '30': 0,
            '31': 0,
            '32': 0,
            '33': 0,
            '34': 0,
            '35': 0,
            '36': 0,
            '37': 0,
            '38': 0,
        };

        // Cache the result
        await redis.setJson(
            eventConfig.cache.averageScoresKey,
            averageScores,
            eventConfig.cache.averageScoresTtl,
        );

        return averageScores;
    } catch (error) {
        console.error('Failed to get event average scores:', error);
        // Return default values in case of error
        return {
            '1': 57,
            '2': 69,
            '3': 64,
            '4': 51,
            '5': 58,
            '6': 50,
            '7': 46,
            '8': 36,
            '9': 54,
            '10': 39,
            '11': 49,
            '12': 49,
            '13': 60,
            '14': 58,
            '15': 50,
            '16': 47,
            '17': 60,
            '18': 51,
            '19': 66,
            '20': 60,
            '21': 55,
            '22': 46,
            '23': 59,
            '24': 87,
            '25': 74,
            '26': 62,
            '27': 53,
            '28': 52,
            '29': 40,
            '30': 0,
            '31': 0,
            '32': 0,
            '33': 0,
            '34': 0,
            '35': 0,
            '36': 0,
            '37': 0,
            '38': 0,
        };
    }
};
