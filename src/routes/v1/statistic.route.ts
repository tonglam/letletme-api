import { Elysia, NotFoundError, t } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { StatService } from '../../services';

export const statisticRoutes = new Elysia({ prefix: '/statistics' })
    .use(errorHandler)
    // Get tournament statistics
    .get(
        '/tournaments/:id',
        async ({ params }) => {
            const stats = await StatService.getTournamentStats(params.id);
            if (!stats) throw new NotFoundError();
            return stats;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['statistics'],
                summary: 'Get tournament statistics',
                description:
                    'Returns statistical data for a specific tournament',
            },
        },
    )
    // Get player statistics
    .get(
        '/players/:id',
        async ({ params, query }) => {
            const stats = await StatService.getPlayerStats(
                params.id,
                query.tournamentId,
            );
            if (!stats) throw new NotFoundError();
            return stats;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            query: t.Object({
                tournamentId: t.Optional(t.String()),
            }),
            detail: {
                tags: ['statistics'],
                summary: 'Get player statistics',
                description: 'Returns statistical data for a specific player',
            },
        },
    )
    // Get head-to-head statistics between two players
    .get(
        '/head-to-head',
        async ({ query }) => {
            const stats = await StatService.getHeadToHeadStats(
                query.player1Id,
                query.player2Id,
                query.tournamentId,
            );
            if (!stats) throw new NotFoundError();
            return stats;
        },
        {
            query: t.Object({
                player1Id: t.String(),
                player2Id: t.String(),
                tournamentId: t.Optional(t.String()),
            }),
            detail: {
                tags: ['statistics'],
                summary: 'Get head-to-head statistics',
                description:
                    'Returns head-to-head statistical data between two players',
            },
        },
    )
    // Get player rankings
    .get(
        '/rankings',
        async ({ query }) => {
            const limit = query.limit ? parseInt(query.limit) : 20;
            const offset = query.offset ? parseInt(query.offset) : 0;

            const rankings = await StatService.getPlayerRankings(limit, offset);
            if (!rankings) throw new NotFoundError();
            return rankings;
        },
        {
            query: t.Object({
                limit: t.Optional(t.String()),
                offset: t.Optional(t.String()),
            }),
            detail: {
                tags: ['statistics'],
                summary: 'Get player rankings',
                description: 'Returns the current player rankings',
            },
        },
    );
