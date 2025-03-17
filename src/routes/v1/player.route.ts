import { Elysia, NotFoundError, t } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { PlayerService } from '../../services';
import type { GetAllPlayersParams } from '../../types';

export const playerRoutes = new Elysia({ prefix: '/players' })
    .use(errorHandler)
    // Get all players
    .get(
        '/',
        async ({ query }) => {
            const params: GetAllPlayersParams = {
                limit: query.limit ? parseInt(query.limit) : 20,
                offset: query.offset ? parseInt(query.offset) : 0,
                search: query.search,
                country: query.country,
            };
            const players = await PlayerService.getAllPlayers(params);
            if (!players?.data || players.data.length === 0)
                throw new NotFoundError();
            return players;
        },
        {
            query: t.Object({
                limit: t.Optional(t.String()),
                offset: t.Optional(t.String()),
                search: t.Optional(t.String()),
                country: t.Optional(t.String()),
            }),
            detail: {
                tags: ['players'],
                summary: 'Get all players',
                description: 'Returns a paginated list of all players',
            },
        },
    )
    // Get player by ID
    .get(
        '/:id',
        async ({ params }) => {
            const player = await PlayerService.getPlayerById(params.id);
            if (!player) throw new NotFoundError();
            return player;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['players'],
                summary: 'Get player by ID',
                description: 'Returns details of a specific player',
            },
        },
    )
    // Get player stats
    .get(
        '/:id/stats',
        async ({ params }) => {
            const stats = await PlayerService.getPlayerStats(params.id);
            if (!stats) throw new NotFoundError();
            return stats;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['players'],
                summary: 'Get player statistics',
                description:
                    'Returns detailed statistics for a specific player',
            },
        },
    )
    // Create new player
    .post(
        '/',
        async ({ body, set }) => {
            const player = await PlayerService.createPlayer(body);
            set.status = 201;
            return player;
        },
        {
            body: t.Object({
                firstName: t.String(),
                lastName: t.String(),
                country: t.String(),
                profileImage: t.Optional(t.String()),
            }),
            detail: {
                tags: ['players'],
                summary: 'Create player',
                description: 'Creates a new player',
            },
        },
    )
    // Update player
    .put(
        '/:id',
        async ({ params, body }) => {
            const player = await PlayerService.updatePlayer(params.id, body);
            if (!player) throw new NotFoundError();
            return player;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                firstName: t.Optional(t.String()),
                lastName: t.Optional(t.String()),
                country: t.Optional(t.String()),
                profileImage: t.Optional(t.String()),
            }),
            detail: {
                tags: ['players'],
                summary: 'Update player',
                description: 'Updates an existing player',
            },
        },
    )
    // Delete player
    .delete(
        '/:id',
        async ({ params, set }) => {
            const deleted = await PlayerService.deletePlayer(params.id);
            if (!deleted) throw new NotFoundError();
            set.status = 204;
            return null;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['players'],
                summary: 'Delete player',
                description: 'Deletes an existing player',
            },
        },
    );
