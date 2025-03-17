/**
 * Event Routes
 * Handles event-related HTTP endpoints
 */
import { Elysia, NotFoundError } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import * as eventService from '../../services/event.service';
import { EventDeadlineSchema, EventScoresSchema } from '../../types/event.type';

export const eventRoutes = new Elysia({ prefix: '/events' })
    .use(errorHandler)
    .get(
        '/current-with-deadline',
        async () => {
            const result = await eventService.getCurrentEventAndDeadline();
            if (!result) throw new NotFoundError();
            return result;
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
            if (!scores) throw new NotFoundError();
            return scores;
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
