/**
 * Event utilities
 * Helper functions for event-related operations
 */
import { eventConfig } from '../config/event';
import { redis } from '../redis';
import type { EventData, EventDeadline } from '../types/event.type';

/**
 * Calculate current season in the format "2324" for 2023-2024
 */
export const getCurrentSeason = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    return month >= eventConfig.season.startMonth
        ? `${(year % 100).toString()}${((year + 1) % 100).toString().padStart(2, '0')}`
        : `${((year - 1) % 100).toString()}${(year % 100).toString().padStart(2, '0')}`;
};

/**
 * Determine current event and deadline based on current time
 */
export const determineCurrentEventAndDeadline = (
    now: Date,
    eventDeadlines: EventData[],
): EventDeadline => {
    // Sort events by deadline
    const sortedEvents = [...eventDeadlines].sort(
        (a, b) =>
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    );

    const nextEventIndex = sortedEvents.findIndex(
        (event) => new Date(event.deadline) > now,
    );

    if (nextEventIndex === -1) {
        // All events are in the past, return the last one
        const lastEvent = sortedEvents[sortedEvents.length - 1];
        return {
            event: lastEvent.event,
            utcDeadline: lastEvent.deadline,
        };
    }

    if (nextEventIndex === 0) {
        // All events are in the future, return the first one
        return {
            event: sortedEvents[0].event,
            utcDeadline: sortedEvents[0].deadline,
        };
    }

    // Current event is the one before the next event
    return {
        event: sortedEvents[nextEventIndex - 1].event,
        utcDeadline: sortedEvents[nextEventIndex].deadline,
    };
};

/**
 * Transform Redis hash data to event array
 */
export const transformRedisData = (
    redisData: Record<string, string>,
): EventData[] => {
    return Object.entries(redisData).map(([event, deadline]) => ({
        event,
        deadline,
    }));
};

/**
 * Get event deadlines from Redis
 */
export const getEventDeadlinesFromRedis = async (
    redisKey: string,
): Promise<EventData[]> => {
    try {
        const data = await redis.getClient().hgetall(redisKey);

        if (!data || Object.keys(data).length === 0) {
            throw new Error(`No event data found for key: ${redisKey}`);
        }

        return transformRedisData(data);
    } catch (error) {
        throw new Error(`Failed to retrieve event deadlines: ${error}`);
    }
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
