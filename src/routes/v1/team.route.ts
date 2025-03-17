import { Elysia, NotFoundError, t } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { TeamService } from '../../services';
import { TeamData } from '../../types';

export const teamRoutes = new Elysia({ prefix: '/teams' })
    .use(errorHandler)
    .get(
        '/',
        async ({ query }) => {
            const teams = await TeamService.getTeamList(query.season);
            if (!teams || teams.length === 0) throw new NotFoundError();
            return teams;
        },
        {
            query: t.Object({
                season: t.String(),
            }),
            response: t.Array(TeamData),
            detail: {
                tags: ['teams'],
                summary: 'Get team list',
                description: 'Returns a list of teams for a specific season',
            },
        },
    );
