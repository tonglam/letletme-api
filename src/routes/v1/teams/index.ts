import { Elysia, t } from 'elysia';
import { CommonService } from '../../../services/common';
import { TeamData } from '../../../types/common.type';

export const teamRoutes = new Elysia({ prefix: '/teams' }).get(
    '/',
    ({ query }) => CommonService.qryTeamList(query.season),
    {
        query: t.Object({
            season: t.String(),
        }),
        response: t.Array(TeamData),
        detail: {
            tags: ['teams'],
            summary: 'Get team list',
            description: 'Returns a list of teams for a specific season',
            responses: {
                200: {
                    description: 'List of teams',
                },
            },
        },
    },
);
