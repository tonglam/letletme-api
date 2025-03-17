/**
 * Event Utilities
 * Helper functions for event-related operations
 */
import { eventConfig } from '../config/event.config';
import { redis } from '../redis';
import type {
    EventData,
    EventDeadline,
    EventDeadlines,
} from '../types/event.type';

/**
 * Get event deadlines from Redis
 * @param redisKey Redis key for event deadlines
 * @returns Event deadlines object
 * @throws Error if deadlines not found or invalid
 */
export const getEventDeadlinesFromRedis = async (
    redisKey: string,
): Promise<EventDeadlines> => {
    const eventDeadlines = await redis.getJson<EventDeadlines>(redisKey);

    if (!eventDeadlines || Object.keys(eventDeadlines).length === 0) {
        throw new Error('Event deadlines not found in Redis');
    }

    return eventDeadlines;
};

/**
 * Get current season based on date
 * @param date Current date
 * @returns Current season (e.g., "2023-24")
 */
export const getCurrentSeason = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-based

    // If we're in the second half of the year (July onwards), it's the start of a new season
    if (month >= 7) {
        return `${year}-${(year + 1).toString().slice(2)}`;
    }
    return `${year - 1}-${year.toString().slice(2)}`;
};

/**
 * Determine current event and next deadline
 * @param currentDate Current date
 * @param eventDeadlines Event deadlines object
 * @returns Current event and next deadline
 */
export const determineCurrentEventAndDeadline = (
    currentDate: Date,
    eventDeadlines: EventDeadlines,
): EventDeadline => {
    const currentTimestamp = currentDate.getTime();
    const events = Object.entries(eventDeadlines);

    // Sort events by deadline timestamp
    const sortedEvents = events.sort(
        ([, a], [, b]) => new Date(a).getTime() - new Date(b).getTime(),
    );

    // Find the next event that hasn't started yet
    const nextEvent = sortedEvents.find(
        ([, deadline]) => new Date(deadline).getTime() > currentTimestamp,
    );

    if (!nextEvent) {
        // If no next event found, return the last event
        const lastEvent = sortedEvents[sortedEvents.length - 1];
        return {
            event: parseInt(lastEvent[0], 10),
            utcDeadline: lastEvent[1],
        };
    }

    // If we found a next event, the current event is the previous one
    const nextEventIndex = parseInt(nextEvent[0], 10);
    return {
        event: nextEventIndex - 1,
        utcDeadline: nextEvent[1],
    };
};

/**
 * Transform Redis hash data to event array
 * @param redisData Redis hash data
 * @returns Array of event data objects
 */
export const transformRedisData = (
    redisData: Record<string, string>,
): EventData[] => {
    return Object.entries(redisData).map(([event, deadline]) => ({
        event: parseInt(event, 10),
        deadline,
    }));
};

/**
 * Cache operations
 */
export const cacheOperations = {
    get: async (): Promise<EventDeadline | null> => {
        try {
            return await redis.getJson<EventDeadline>(eventConfig.cache.key);
        } catch (error) {
            throw new Error(`Cache read error: ${error}`);
        }
    },

    set: async (data: EventDeadline): Promise<void> => {
        try {
            await redis.setJson(
                eventConfig.cache.key,
                data,
                eventConfig.cache.ttl,
            );
        } catch (error) {
            throw new Error(`Cache write error: ${error}`);
        }
    },

    clear: async (): Promise<void> => {
        try {
            await redis.del(eventConfig.cache.key);
        } catch (error) {
            throw new Error(`Cache clear error: ${error}`);
        }
    },
};

/**
 * Event utility functions
 */

/**
 * Get current event from Redis
 */
export const getCurrentEvent = async (): Promise<number | null> => {
    try {
        const currentEvent = await redis.getJson<{ event: number }>(
            'current-event',
        );
        return currentEvent?.event || null;
    } catch (error) {
        console.error('Error getting current event:', error);
        return null;
    }
};

/**
 * Get next event based on current event
 */
export const getNextEvent = async (
    currentEvent: number,
): Promise<number | null> => {
    try {
        // Get total events from Redis
        const totalEvents = await redis.getJson<number>('total-events');
        if (!totalEvents) {
            return null;
        }

        // Calculate next event
        const nextEvent = currentEvent + 1;
        return nextEvent <= totalEvents ? nextEvent : null;
    } catch (error) {
        console.error('Error getting next event:', error);
        return null;
    }
};
