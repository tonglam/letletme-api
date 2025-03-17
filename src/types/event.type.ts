import { t } from 'elysia';

/**
 * Event Schemas
 * Elysia validation schemas for event-related data
 */
export const EventDeadlineSchema = t.Object({
    event: t.Number(),
    utcDeadline: t.String(),
});

export const EventScoresSchema = t.Object({
    scores: t.Record(t.String(), t.Number()),
});

export const EventDataSchema = t.Object({
    event: t.Number(),
    deadline: t.String(),
    averageScore: t.Optional(t.Number()),
});

/**
 * Event Types
 * TypeScript type definitions for event-related data
 */

/**
 * Event deadline information
 */
export type EventDeadline = {
    event: number;
    utcDeadline: string;
};

/**
 * Event deadlines mapping
 * Key: event number (as string)
 * Value: UTC deadline string
 */
export type EventDeadlines = {
    [event: string]: string;
};

/**
 * Event scores mapping
 * Key: event number (as string)
 * Value: average score for the event
 */
export type EventScores = {
    scores: {
        [event: string]: number;
    };
};

/**
 * Event data structure
 */
export type EventData = {
    event: number;
    deadline: string;
    averageScore?: number;
};
