import { Elysia, t } from 'elysia';
import { HttpStatusCode } from 'elysia-http-status-code';

export const playerRoutes = new Elysia({ prefix: '/player' })
    .use(HttpStatusCode())
    // Get all players
    .get(
        '/',
        async ({ query }) => {
            // Mock response - to be implemented with actual database queries
            const limit = query.limit ? parseInt(query.limit as string) : 20;
            const offset = query.offset ? parseInt(query.offset as string) : 0;

            return {
                status: 'success',
                meta: {
                    total: 100,
                    limit,
                    offset,
                },
                data: Array(Math.min(limit, 10))
                    .fill(0)
                    .map((_, i) => ({
                        id: (i + offset + 1).toString(),
                        name: `Player ${i + offset + 1}`,
                        country: 'US',
                        rating: 1500 + Math.floor(Math.random() * 1000),
                    })),
            };
        },
        {
            detail: {
                tags: ['player'],
                summary: 'Get all players',
                description: 'Returns a paginated list of all players',
                responses: {
                    200: {
                        description: 'List of players',
                    },
                },
            },
            query: t.Object({
                limit: t.Optional(t.String()),
                offset: t.Optional(t.String()),
                search: t.Optional(t.String()),
                country: t.Optional(t.String()),
            }),
        },
    )
    // Get player by ID
    .get(
        '/:id',
        async ({ params }) => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                data: {
                    id: params.id,
                    name: `Player ${params.id}`,
                    firstName: 'John',
                    lastName: 'Doe',
                    country: 'US',
                    rating: 1800,
                    tournaments: 15,
                    wins: 10,
                    losses: 5,
                    profileImage: 'https://example.com/profiles/player1.jpg',
                },
            };
        },
        {
            detail: {
                tags: ['player'],
                summary: 'Get player by ID',
                description: 'Returns details of a specific player',
                responses: {
                    200: {
                        description: 'Player details',
                    },
                    404: {
                        description: 'Player not found',
                    },
                },
            },
            params: t.Object({
                id: t.String(),
            }),
        },
    )
    // Get player stats
    .get(
        '/:id/stats',
        async ({ params }) => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                data: {
                    playerId: params.id,
                    tournamentCount: 15,
                    matchesPlayed: 30,
                    wins: 20,
                    losses: 10,
                    winRate: 0.67,
                    averageScore: 21.5,
                    highestScore: 29,
                    recentForm: ['W', 'L', 'W', 'W', 'W'],
                },
            };
        },
        {
            detail: {
                tags: ['player'],
                summary: 'Get player statistics',
                description:
                    'Returns detailed statistics for a specific player',
                responses: {
                    200: {
                        description: 'Player statistics',
                    },
                    404: {
                        description: 'Player not found',
                    },
                },
            },
            params: t.Object({
                id: t.String(),
            }),
        },
    )
    // Create new player
    .post(
        '/',
        async ({ body, set }) => {
            // Mock response - to be implemented with actual database queries
            set.status = 201;
            return {
                status: 'success',
                message: 'Player created successfully',
                data: {
                    id: Math.floor(Math.random() * 1000).toString(),
                    ...body,
                    rating: 1500, // Default starting rating
                },
            };
        },
        {
            detail: {
                tags: ['player'],
                summary: 'Create player',
                description: 'Creates a new player',
                responses: {
                    201: {
                        description: 'Player created successfully',
                    },
                    400: {
                        description: 'Invalid input',
                    },
                },
            },
            body: t.Object({
                firstName: t.String(),
                lastName: t.String(),
                country: t.String(),
                profileImage: t.Optional(t.String()),
            }),
        },
    )
    // Update player
    .put(
        '/:id',
        async ({ params, body }) => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                message: 'Player updated successfully',
                data: {
                    id: params.id,
                    ...body,
                },
            };
        },
        {
            detail: {
                tags: ['player'],
                summary: 'Update player',
                description: 'Updates an existing player',
                responses: {
                    200: {
                        description: 'Player updated successfully',
                    },
                    404: {
                        description: 'Player not found',
                    },
                    400: {
                        description: 'Invalid input',
                    },
                },
            },
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                firstName: t.Optional(t.String()),
                lastName: t.Optional(t.String()),
                country: t.Optional(t.String()),
                profileImage: t.Optional(t.String()),
            }),
        },
    )
    // Delete player
    .delete(
        '/:id',
        async ({ params, set }) => {
            // Mock implementation - actually delete the player with ID params.id
            console.log(`Deleting player with ID: ${params.id}`);
            set.status = 204;
            return null;
        },
        {
            detail: {
                tags: ['player'],
                summary: 'Delete player',
                description: 'Deletes an existing player',
                responses: {
                    204: {
                        description: 'Player deleted successfully',
                    },
                    404: {
                        description: 'Player not found',
                    },
                },
            },
            params: t.Object({
                id: t.String(),
            }),
        },
    );
