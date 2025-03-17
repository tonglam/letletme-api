import { Elysia } from 'elysia';
import * as eventService from '../../services/event.service';
import { EventDeadline, EventScores } from '../../types/event.type';

export const eventRoutes = new Elysia({ prefix: '/events' })
    .get(
        '/current-with-deadline',
        async () => {
            const result = await eventService.getCurrentEventAndDeadline();

            // Explicitly construct the response object with the expected type
            const response: EventDeadline = {
                event: result.event,
                utcDeadline: result.utcDeadline,
            };

            return response;
        },
        {
            response: EventDeadline,
            detail: {
                tags: ['events'],
                summary: 'Get current event and next deadline',
                description:
                    'Returns information about the current event and the next UTC deadline',
                responses: {
                    200: {
                        description: 'Current event and deadline information',
                    },
                },
            },
        },
    )
    .get(
        '/average-scores',
        async () => {
            return await eventService.getEventAverageScores();
        },
        {
            response: EventScores,
            detail: {
                tags: ['events'],
                summary: 'Get event average scores',
                description: 'Returns average scores for events',
                responses: {
                    200: {
                        description: 'Event average scores',
                    },
                },
            },
        },
    );
