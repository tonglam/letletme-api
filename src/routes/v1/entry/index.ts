import { Elysia, t } from 'elysia';
import { HttpStatusCode } from 'elysia-http-status-code';

export const entryRoutes = new Elysia({ prefix: '/entry' })
    .use(HttpStatusCode())
    // Get all match entries
    .get(
        '/',
        async ({ query }) => {
            // Mock response - to be implemented with actual database queries
            const limit = query.limit ? parseInt(query.limit as string) : 20;
            const offset = query.offset ? parseInt(query.offset as string) : 0;
            const tournamentId = query.tournamentId as string | undefined;

            return {
                status: 'success',
                meta: {
                    total: 150,
                    limit,
                    offset,
                    tournamentId,
                },
                data: Array(Math.min(limit, 10))
                    .fill(0)
                    .map((_, i) => ({
                        id: (i + offset + 1).toString(),
                        tournamentId: tournamentId || '1',
                        player1Id: `p${i * 2 + 1}`,
                        player2Id: `p${i * 2 + 2}`,
                        score: [21, 15],
                        status: 'completed',
                        round: Math.floor(i / 4) + 1,
                        court: (i % 4) + 1,
                        scheduledTime: new Date(
                            Date.now() + i * 3600000,
                        ).toISOString(),
                    })),
            };
        },
        {
            detail: {
                tags: ['entry'],
                summary: 'Get all match entries',
                description: 'Returns a paginated list of all match entries',
                responses: {
                    200: {
                        description: 'List of match entries',
                    },
                },
            },
            query: t.Object({
                limit: t.Optional(t.String()),
                offset: t.Optional(t.String()),
                tournamentId: t.Optional(t.String()),
                playerId: t.Optional(t.String()),
                status: t.Optional(t.String()),
                round: t.Optional(t.String()),
            }),
        },
    )
    // Get match entry by ID
    .get(
        '/:id',
        async ({ params }) => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                data: {
                    id: params.id,
                    tournamentId: '1',
                    player1Id: 'p1',
                    player2Id: 'p2',
                    score: [21, 15],
                    status: 'completed',
                    round: 1,
                    court: 2,
                    scheduledTime: new Date().toISOString(),
                    actualStartTime: new Date().toISOString(),
                    duration: 45, // minutes
                    winner: 'p1',
                    referee: 'ref1',
                },
            };
        },
        {
            detail: {
                tags: ['entry'],
                summary: 'Get match entry by ID',
                description: 'Returns details of a specific match entry',
                responses: {
                    200: {
                        description: 'Match entry details',
                    },
                    404: {
                        description: 'Match entry not found',
                    },
                },
            },
            params: t.Object({
                id: t.String(),
            }),
        },
    )
    // Create new match entry
    .post(
        '/',
        async ({ body, set }) => {
            // Mock response - to be implemented with actual database queries
            set.status = 201;
            return {
                status: 'success',
                message: 'Match entry created successfully',
                data: {
                    id: Math.floor(Math.random() * 1000).toString(),
                    ...body,
                    status: body.status || 'scheduled',
                },
            };
        },
        {
            detail: {
                tags: ['entry'],
                summary: 'Create match entry',
                description: 'Creates a new match entry',
                responses: {
                    201: {
                        description: 'Match entry created successfully',
                    },
                    400: {
                        description: 'Invalid input',
                    },
                },
            },
            body: t.Object({
                tournamentId: t.String(),
                player1Id: t.String(),
                player2Id: t.String(),
                round: t.Number(),
                court: t.Optional(t.Number()),
                scheduledTime: t.String(),
                status: t.Optional(t.String({ default: 'scheduled' })),
            }),
        },
    )
    // Update match entry
    .put(
        '/:id',
        async ({ params, body }) => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                message: 'Match entry updated successfully',
                data: {
                    id: params.id,
                    ...body,
                },
            };
        },
        {
            detail: {
                tags: ['entry'],
                summary: 'Update match entry',
                description: 'Updates an existing match entry',
                responses: {
                    200: {
                        description: 'Match entry updated successfully',
                    },
                    404: {
                        description: 'Match entry not found',
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
                tournamentId: t.Optional(t.String()),
                player1Id: t.Optional(t.String()),
                player2Id: t.Optional(t.String()),
                score: t.Optional(t.Array(t.Number())),
                round: t.Optional(t.Number()),
                court: t.Optional(t.Number()),
                scheduledTime: t.Optional(t.String()),
                actualStartTime: t.Optional(t.String()),
                duration: t.Optional(t.Number()),
                status: t.Optional(t.String()),
                winner: t.Optional(t.String()),
                referee: t.Optional(t.String()),
            }),
        },
    )
    // Update match score
    .patch(
        '/:id/score',
        async ({ params, body }) => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                message: 'Match score updated successfully',
                data: {
                    id: params.id,
                    score: body.score,
                    status: body.status || 'in_progress',
                    winner: body.winner,
                },
            };
        },
        {
            detail: {
                tags: ['entry'],
                summary: 'Update match score',
                description: 'Updates the score for an existing match',
                responses: {
                    200: {
                        description: 'Match score updated successfully',
                    },
                    404: {
                        description: 'Match entry not found',
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
                score: t.Array(t.Number()),
                status: t.Optional(t.String()),
                winner: t.Optional(t.String()),
            }),
        },
    )
    // Delete match entry
    .delete(
        '/:id',
        async ({ params, set }) => {
            // Mock implementation - actually delete the match with ID params.id
            console.log(`Deleting match entry with ID: ${params.id}`);
            set.status = 204;
            return null;
        },
        {
            detail: {
                tags: ['entry'],
                summary: 'Delete match entry',
                description: 'Deletes an existing match entry',
                responses: {
                    204: {
                        description: 'Match entry deleted successfully',
                    },
                    404: {
                        description: 'Match entry not found',
                    },
                },
            },
            params: t.Object({
                id: t.String(),
            }),
        },
    );
