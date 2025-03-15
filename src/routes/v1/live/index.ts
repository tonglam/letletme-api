import { Elysia, t } from 'elysia';
import { HttpStatusCode } from 'elysia-http-status-code';

export const liveRoutes = new Elysia({ prefix: '/live' })
    .use(HttpStatusCode())
    // Get all live matches
    .get(
        '/matches',
        async ({ query }) => {
            // Mock response - to be implemented with actual database and Redis queries
            const tournamentId = query.tournamentId as string | undefined;

            return {
                status: 'success',
                data: Array(5)
                    .fill(0)
                    .map((_, i) => ({
                        id: (i + 1).toString(),
                        tournamentId: tournamentId || '1',
                        player1: {
                            id: `p${i * 2 + 1}`,
                            name: `Player ${i * 2 + 1}`,
                            country: 'US',
                        },
                        player2: {
                            id: `p${i * 2 + 2}`,
                            name: `Player ${i * 2 + 2}`,
                            country: 'UK',
                        },
                        score: [i * 3, i * 2 + 1],
                        currentSet: 1,
                        status: 'in_progress',
                        court: i + 1,
                        startTime: new Date(
                            Date.now() - i * 600000,
                        ).toISOString(),
                        lastUpdated: new Date().toISOString(),
                    })),
            };
        },
        {
            detail: {
                tags: ['live'],
                summary: 'Get all live matches',
                description: 'Returns a list of all currently live matches',
                responses: {
                    200: {
                        description: 'List of live matches',
                    },
                },
            },
            query: t.Object({
                tournamentId: t.Optional(t.String()),
            }),
        },
    )
    // Get specific live match
    .get(
        '/matches/:id',
        async ({ params }) => {
            // Mock response - to be implemented with actual Redis caching
            return {
                status: 'success',
                data: {
                    id: params.id,
                    tournamentId: '1',
                    player1: {
                        id: 'p1',
                        name: 'John Doe',
                        country: 'US',
                        ranking: 5,
                    },
                    player2: {
                        id: 'p2',
                        name: 'Jane Smith',
                        country: 'UK',
                        ranking: 8,
                    },
                    score: [15, 12],
                    currentSet: 1,
                    status: 'in_progress',
                    court: 3,
                    startTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
                    duration: 30, // minutes elapsed
                    lastUpdated: new Date().toISOString(),
                    statistics: {
                        player1: {
                            aces: 3,
                            doubleFaults: 1,
                            firstServePercentage: 0.68,
                            winnersCount: 12,
                            errorsCount: 8,
                        },
                        player2: {
                            aces: 2,
                            doubleFaults: 2,
                            firstServePercentage: 0.72,
                            winnersCount: 10,
                            errorsCount: 6,
                        },
                    },
                },
            };
        },
        {
            detail: {
                tags: ['live'],
                summary: 'Get live match by ID',
                description:
                    'Returns detailed real-time data for a specific match',
                responses: {
                    200: {
                        description: 'Live match details',
                    },
                    404: {
                        description: 'Match not found or not live',
                    },
                },
            },
            params: t.Object({
                id: t.String(),
            }),
        },
    )
    // Update live match score (for authorized users)
    .patch(
        '/matches/:id/score',
        async ({ params, body, set }) => {
            // Mock response - to be implemented with actual Redis updates
            // In a real implementation, this would also trigger WebSocket notifications
            set.status = 200;
            return {
                status: 'success',
                message: 'Live match score updated successfully',
                data: {
                    id: params.id,
                    score: body.score,
                    status: body.status || 'in_progress',
                    lastUpdated: new Date().toISOString(),
                },
            };
        },
        {
            detail: {
                tags: ['live'],
                summary: 'Update live match score',
                description: 'Updates the score for a live match in real-time',
                responses: {
                    200: {
                        description: 'Match score updated successfully',
                    },
                    404: {
                        description: 'Match not found or not live',
                    },
                    400: {
                        description: 'Invalid input',
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                },
            },
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                score: t.Array(t.Number()),
                status: t.Optional(t.String()),
            }),
        },
    )
    // Update match statistics
    .patch(
        '/matches/:id/statistics',
        async ({ params, body }) => {
            // Mock response - to be implemented with actual Redis updates
            return {
                status: 'success',
                message: 'Match statistics updated successfully',
                data: {
                    id: params.id,
                    statistics: body.statistics,
                    lastUpdated: new Date().toISOString(),
                },
            };
        },
        {
            detail: {
                tags: ['live'],
                summary: 'Update match statistics',
                description: 'Updates the statistics for a live match',
                responses: {
                    200: {
                        description: 'Match statistics updated successfully',
                    },
                    404: {
                        description: 'Match not found or not live',
                    },
                    400: {
                        description: 'Invalid input',
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                },
            },
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
        },
    )
    // Get tournament's courts status
    .get(
        '/courts',
        async ({ query }) => {
            // Mock response - to be implemented with actual Redis caching
            const tournamentId = (query.tournamentId as string) || '1';

            return {
                status: 'success',
                data: Array(6)
                    .fill(0)
                    .map((_, i) => ({
                        id: (i + 1).toString(),
                        tournamentId,
                        name: `Court ${i + 1}`,
                        status: i < 4 ? 'occupied' : 'available',
                        currentMatchId: i < 4 ? `match${i + 1}` : null,
                        nextMatchId: i === 4 ? 'match5' : null,
                    })),
            };
        },
        {
            detail: {
                tags: ['live'],
                summary: 'Get courts status',
                description:
                    'Returns the current status of all courts in a tournament',
                responses: {
                    200: {
                        description: 'Courts status',
                    },
                },
            },
            query: t.Object({
                tournamentId: t.Optional(t.String()),
            }),
        },
    );
