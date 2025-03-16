import { Elysia, t } from 'elysia';
import { CommonService } from '../../../services/common';
import { EventDeadline, EventScores } from '../../../types/common.type';

export const eventRoutes = new Elysia({ prefix: '/events' })
    .get(
        '/current-with-deadline',
        () => CommonService.qryCurrentEventAndNextUtcDeadline(),
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
    .post('/refresh', () => CommonService.refreshEventAndDeadline(), {
        response: t.Void(),
        detail: {
            tags: ['events'],
            summary: 'Refresh event and deadline',
            description: 'Refreshes the current event and deadline information',
            responses: {
                200: {
                    description: 'Event and deadline refreshed successfully',
                },
            },
        },
    })
    .post(
        '/:event/cache',
        ({ params }) => CommonService.insertEventLiveCache(params.event),
        {
            params: t.Object({
                event: t.Number(),
            }),
            response: t.Void(),
            detail: {
                tags: ['events'],
                summary: 'Insert event live cache',
                description: 'Inserts live cache data for a specific event',
                responses: {
                    200: {
                        description: 'Event live cache inserted successfully',
                    },
                },
            },
        },
    )
    .get('/average-scores', () => CommonService.qryEventAverageScore(), {
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
    });
