import { Elysia, t } from 'elysia';
import { TeamService } from '../../services';
import { TeamData } from '../../types';

export const teamRoutes = new Elysia({ prefix: '/teams' }).get(
    '/',
    ({ query }) => TeamService.getTeamList(query.season),
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
