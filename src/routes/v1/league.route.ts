import { Elysia, t } from 'elysia';
import { LeagueService } from '../../services';
import { LeagueInfoData } from '../../types';

export const leagueRoutes = new Elysia({ prefix: '/leagues' }).get(
    '/',
    ({ query }) => LeagueService.getAllLeagueNames(query.season),
    {
        query: t.Object({
            season: t.String(),
        }),
        response: t.Array(LeagueInfoData),
        detail: {
            tags: ['leagues'],
            summary: 'Get all league names',
            description:
                'Returns a list of all league names for a specific season',
            responses: {
                200: {
                    description: 'List of league names',
                },
            },
        },
    },
);
