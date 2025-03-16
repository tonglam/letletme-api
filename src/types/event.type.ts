import { t } from 'elysia';

/**
 * Event deadline schema
 * Information about event deadlines
 */
export const EventDeadline = t.Object({
    currentEvent: t.String(),
    nextDeadline: t.String(),
});

/**
 * Event scores schema
 * Record of event scores
 */
export const EventScores = t.Record(t.String(), t.Number());

/**
 * Internal event data type
 */
export const EventData = t.Object({
    event: t.String(),
    deadline: t.String(),
});

// Export TypeScript types
export type EventDeadline = typeof EventDeadline.static;
export type EventScores = typeof EventScores.static;
export type EventData = typeof EventData.static;
