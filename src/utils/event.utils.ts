/**
 * Event Utilities
 * Helper functions for event-related operations
 */
import { SEASON_CONFIG } from '../config/app.config';
import {
    CacheServiceName,
    serviceTTLRules,
} from '../config/cache.redis.config';
import { logger } from '../config/logger.config';
import { cacheRedis, dataRedis } from '../redis';
import type { EventDeadline, EventDeadlines } from '../types/event.type';
import { eventKeys } from './redis-key.utils';

/**
 * Get event deadlines from Redis
 */
export const getEventDeadlinesFromRedis = async (
    season: string = getCurrentSeason(),
): Promise<EventDeadlines | null> => {
    try {
        const key = eventKeys.eventDeadlines(season);
        const data = await dataRedis.hgetall(key);
        if (!data || Object.keys(data).length === 0) {
            return null;
        }
        // Convert hash to EventDeadlines format
        const deadlines: EventDeadlines = {};
        for (const [event, deadline] of Object.entries(data)) {
            try {
                deadlines[event] = JSON.parse(deadline);
            } catch (parseErr) {
                logger.error(
                    { parseErr, event, deadline },
                    'Failed to parse deadline JSON',
                );
                return null;
            }
        }
        return deadlines;
    } catch (err) {
        logger.error({ err }, 'Failed to get event deadlines from Redis');
        return null;
    }
};

/**
 * Get current season based on date
 * @returns Season in format "2425" for 2024/25
 */
export const getCurrentSeason = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (month >= SEASON_CONFIG.SEASON.START_MONTH) {
        // Return format "2425" for 2024/25
        return `${year.toString().slice(2)}${(year + 1).toString().slice(2)}`;
    }
    // Return format "2324" for 2023/24
    return `${(year - 1).toString().slice(2)}${year.toString().slice(2)}`;
};

/**
 * Determine current event and deadline based on date
 */
export const determineCurrentEventAndDeadline = (
    currentDate: Date,
    eventDeadlines: EventDeadlines,
): EventDeadline => {
    // Convert deadlines to array for easier processing
    const deadlines = Object.entries(eventDeadlines).map(
        ([event, utcDeadline]) => ({
            event: parseInt(event, 10),
            utcDeadline,
        }),
    );

    // Sort by deadline time
    deadlines.sort((a, b) => {
        const timeA = new Date(a.utcDeadline).getTime();
        const timeB = new Date(b.utcDeadline).getTime();
        return timeA - timeB;
    });

    // Find current event based on deadline
    const currentTime = currentDate.getTime();
    for (let i = 0; i < deadlines.length; i++) {
        const deadline = deadlines[i];
        const deadlineTime = new Date(deadline.utcDeadline).getTime();

        if (currentTime < deadlineTime) {
            // If this is the first deadline, return it
            if (i === 0) {
                return deadline;
            }
            // Otherwise return the previous event
            return deadlines[i - 1];
        }
    }

    // If all deadlines have passed, return the last event
    return deadlines[deadlines.length - 1];
};

/**
 * Get and cache current event
 */
export const getCurrentEvent = async (): Promise<number | null> => {
    try {
        // Try to get from cache first
        const cachedEvent = await cacheRedis.get(eventKeys.currentEvent());
        if (cachedEvent) {
            try {
                const parsed = JSON.parse(cachedEvent);
                if (parsed && typeof parsed.event === 'number') {
                    return parsed.event;
                }
            } catch (parseErr) {
                logger.warn(
                    { parseErr },
                    'Failed to parse cached event, falling back to Redis',
                );
            }
        }

        // Get event deadlines
        const eventDeadlines = await getEventDeadlinesFromRedis();
        if (!eventDeadlines) {
            return null;
        }

        // Determine current event
        const currentDate = new Date();
        const { event } = determineCurrentEventAndDeadline(
            currentDate,
            eventDeadlines,
        );

        // Cache the result with TTL
        const ttl = serviceTTLRules[CacheServiceName.EVENT];
        await cacheRedis.set(
            eventKeys.currentEvent(),
            JSON.stringify({ event }),
            ttl,
        );

        return event;
    } catch (err) {
        logger.error({ err }, 'Failed to get current event');
        return null;
    }
};

/**
 * Get next event number
 */
export const getNextEvent = async (
    currentEvent: number,
): Promise<number | null> => {
    const nextEvent = currentEvent + 1;
    return nextEvent <= SEASON_CONFIG.SEASON.TOTAL_GAMEWEEKS ? nextEvent : null;
};
