import { Elysia, NotFoundError, t } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { LeagueService } from '../../services';
import { LeagueInfoData } from '../../types';

export const leagueRoutes = new Elysia({ prefix: '/leagues' })
    .use(errorHandler)
    .get(
        '/',
        async ({ query }) => {
            const leagues = await LeagueService.getAllLeagueNames(query.season);
            if (!leagues || leagues.length === 0) throw new NotFoundError();
            return leagues;
        },
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
            },
        },
    );
