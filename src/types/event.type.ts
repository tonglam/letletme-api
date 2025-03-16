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
 * Event details schema
 * Detailed information about an event
 */
export const EventDetailsData = t.Object({
    id: t.Number(),
    name: t.String(),
    startDate: t.String(),
    endDate: t.String(),
    status: t.String(),
    fixtures: t.Number(),
    completed: t.Number(),
    inProgress: t.Number(),
    upcoming: t.Number(),
});

// Export TypeScript types
export type EventDeadline = typeof EventDeadline.static;
export type EventScores = typeof EventScores.static;
export type EventDetailsData = typeof EventDetailsData.static;
