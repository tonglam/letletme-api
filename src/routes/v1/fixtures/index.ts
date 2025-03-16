import { Elysia, t } from 'elysia';
import { CommonService } from '../../../services/common';
import { PlayerFixtureData } from '../../../types/common.type';

export const fixtureRoutes = new Elysia({ prefix: '/fixtures' }).get(
    '/next',
    ({ query }) => CommonService.qryNextFixture(query.event),
    {
        query: t.Object({
            event: t.Number(),
        }),
        response: t.Array(PlayerFixtureData),
        detail: {
            tags: ['fixtures'],
            summary: 'Get next fixture',
            description:
                'Returns information about the next fixture for a specific event',
            responses: {
                200: {
                    description: 'Next fixture information',
                },
            },
        },
    },
);
