import { Elysia, NotFoundError, t } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { LiveService } from '../../services';

export const liveRoutes = new Elysia({ prefix: '/live' })
    .use(errorHandler)
    // Get all live matches
    .get(
        '/matches',
        async ({ query }) => {
            const matches = await LiveService.getLiveMatches(
                query.tournamentId,
            );
            if (!matches?.data || matches.data.length === 0)
                throw new NotFoundError();
            return matches;
        },
        {
            query: t.Object({
                tournamentId: t.Optional(t.String()),
            }),
            detail: {
                tags: ['live'],
                summary: 'Get all live matches',
                description: 'Returns a list of all currently live matches',
            },
        },
    )
    // Get specific live match
    .get(
        '/matches/:id',
        async ({ params }) => {
            const match = await LiveService.getLiveMatches(params.id);
            if (!match) throw new NotFoundError();
            return match;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['live'],
                summary: 'Get live match by ID',
                description:
                    'Returns detailed real-time data for a specific match',
            },
        },
    )
    // Update live match score
    .patch(
        '/matches/:id/score',
        async ({ params, body, set }) => {
            const match = await LiveService.updateLiveMatchScore(
                params.id,
                body,
            );
            if (!match) throw new NotFoundError();
            set.status = 200;
            return match;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                score: t.Array(t.Number()),
                status: t.Optional(t.String()),
            }),
            detail: {
                tags: ['live'],
                summary: 'Update live match score',
                description: 'Updates the score for a live match in real-time',
            },
        },
    )
    // Update match statistics
    .patch(
        '/matches/:id/statistics',
        async ({ params, body }) => {
            const match = await LiveService.updateMatchStatistics(params.id, {
                statistics: body.statistics,
            });
            if (!match) throw new NotFoundError();
            return match;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                statistics: t.Object({
                    player1: t.Object({
                        aces: t.Optional(t.Number()),
                        doubleFaults: t.Optional(t.Number()),
                        firstServePercentage: t.Optional(t.Number()),
                        winnersCount: t.Optional(t.Number()),
                        errorsCount: t.Optional(t.Number()),
                    }),
                    player2: t.Object({
                        aces: t.Optional(t.Number()),
                        doubleFaults: t.Optional(t.Number()),
                        firstServePercentage: t.Optional(t.Number()),
                        winnersCount: t.Optional(t.Number()),
                        errorsCount: t.Optional(t.Number()),
                    }),
                }),
            }),
            detail: {
                tags: ['live'],
                summary: 'Update match statistics',
                description: 'Updates the statistics for a live match',
            },
        },
    )
    // Get tournament's courts status
    .get(
        '/courts',
        async ({ query }) => {
            const courts = await LiveService.getCourtsStatus(
                query.tournamentId || '1',
            );
            if (!courts?.data || courts.data.length === 0)
                throw new NotFoundError();
            return courts;
        },
        {
            query: t.Object({
                tournamentId: t.Optional(t.String()),
            }),
            detail: {
                tags: ['live'],
                summary: 'Get courts status',
                description:
                    'Returns the current status of all courts in a tournament',
            },
        },
    );
