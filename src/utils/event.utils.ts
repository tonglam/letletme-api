/**
 * Event Utilities
 * Helper functions for event-related operations
 */
import { eventConfig } from '../config/event.config';
import { redis } from '../redis';
import type { EventDeadline, EventDeadlines } from '../types/event.type';
import { eventKeys } from './redis-key.utils';

/**
 * Get data from Redis with error handling
 */
const getRedisData = async <T>(key: string): Promise<T | null> => {
    try {
        return await redis.getJson<T>(key);
    } catch (error) {
        console.error(`Error getting data from Redis (${key}):`, error);
        return null;
    }
};

/**
 * Get event deadlines from Redis
 */
export const getEventDeadlinesFromRedis = async (
    season: string = getCurrentSeason(),
): Promise<EventDeadlines> => {
    const eventDeadlines = await getRedisData<EventDeadlines>(
        eventKeys.eventDeadlines(season),
    );

    if (!eventDeadlines || Object.keys(eventDeadlines).length === 0) {
        throw new Error(`Event deadlines not found for season ${season}`);
    }

    return eventDeadlines;
};

/**
 * Get current season based on date
 */
export const getCurrentSeason = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (month >= eventConfig.season.startMonth) {
        return `${year}-${(year + 1).toString().slice(2)}`;
    }
    return `${year - 1}-${year.toString().slice(2)}`;
};

/**
 * Determine current event and next deadline
 */
export const determineCurrentEventAndDeadline = (
    currentDate: Date,
    eventDeadlines: EventDeadlines,
): EventDeadline => {
    const currentTimestamp = currentDate.getTime();
    const events = Object.entries(eventDeadlines);
    const sortedEvents = events.sort(
        ([, a], [, b]) => new Date(a).getTime() - new Date(b).getTime(),
    );

    const nextEvent = sortedEvents.find(
        ([, deadline]) => new Date(deadline).getTime() > currentTimestamp,
    );

    if (!nextEvent) {
        const lastEvent = sortedEvents[sortedEvents.length - 1];
        return {
            event: parseInt(lastEvent[0], 10),
            utcDeadline: lastEvent[1],
        };
    }

    const nextEventIndex = parseInt(nextEvent[0], 10);
    return {
        event: nextEventIndex - 1,
        utcDeadline: nextEvent[1],
    };
};

/**
 * Cache operations for current event
 */
export const currentEventCache = {
    get: async (): Promise<number | null> => {
        try {
            const data = await redis.getJson<{ event: number }>(
                eventKeys.currentEvent(),
            );
            return data?.event || null;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    },

    set: async (event: number): Promise<void> => {
        try {
            await redis.setJson(
                eventKeys.currentEvent(),
                { event },
                eventConfig.cache.ttl,
            );
        } catch (error) {
            console.error('Cache write error:', error);
        }
    },
};

/**
 * Get and cache current event
 */
export const getCurrentEvent = async (): Promise<number | null> => {
    // Try to get from cache first
    const cachedEvent = await currentEventCache.get();
    if (cachedEvent !== null) {
        return cachedEvent;
    }

    // Calculate current event from deadlines
    try {
        const eventDeadlines = await getEventDeadlinesFromRedis();
        const currentDate = new Date();
        const { event } = determineCurrentEventAndDeadline(
            currentDate,
            eventDeadlines,
        );

        // Cache the calculated event
        await currentEventCache.set(event);
        return event;
    } catch (error) {
        console.error('Error calculating current event:', error);
        return null;
    }
};

/**
 * Get next event based on current event
 */
export const getNextEvent = async (
    currentEvent: number,
): Promise<number | null> => {
    const nextEvent = currentEvent + 1;
    return nextEvent <= eventConfig.season.totalEvents ? nextEvent : null;
};
