/**
 * Event Routes
 * Handles event-related HTTP endpoints
 */
import { Elysia } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import * as eventService from '../../services/event.service';
import { EventDeadlineSchema, EventScoresSchema } from '../../types/event.type';

export const eventRoutes = new Elysia({ prefix: '/events' })
    .use(errorHandler)
    .get(
        '/current-with-deadline',
        async () => {
            const result = await eventService.getCurrentEventAndDeadline();
            return result || { event: null, nextDeadline: null };
        },
        {
            response: EventDeadlineSchema,
            detail: {
                tags: ['events'],
                summary: 'Get current event and next deadline',
                description:
                    'Returns information about the current event and the next UTC deadline',
            },
        },
    )
    .get(
        '/average-scores',
        async () => {
            const scores = await eventService.getEventAverageScores();
            return scores || { scores: {} };
        },
        {
            response: EventScoresSchema,
            detail: {
                tags: ['events'],
                summary: 'Get event average scores',
                description: 'Returns average scores for all events',
            },
        },
    );
