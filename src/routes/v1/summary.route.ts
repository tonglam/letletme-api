import { Elysia, t } from 'elysia';
import { HttpStatusCode } from 'elysia-http-status-code';

export const summaryRoutes = new Elysia({ prefix: '/summaries' })
    .use(HttpStatusCode())
    // Get tournament summary
    .get(
        '/tournaments/:id',
        async ({ params }) => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                data: {
                    tournamentId: params.id,
                    name: 'Summer Championship 2023',
                    startDate: '2023-06-15',
                    endDate: '2023-06-30',
                    status: 'in_progress',
                    currentRound: 3,
                    totalRounds: 5,
                    matchesCompleted: 48,
                    matchesRemaining: 16,
                    participantsCount: 64,
                    topPerformers: [
                        {
                            playerId: 'p1',
                            playerName: 'John Doe',
                            status: 'active',
                            statistics: {
                                wins: 3,
                                setsWon: 6,
                                averageScore: 21.5,
                            },
                        },
                        {
                            playerId: 'p2',
                            playerName: 'Jane Smith',
                            status: 'active',
                            statistics: {
                                wins: 3,
                                setsWon: 6,
                                averageScore: 20.8,
                            },
                        },
                    ],
                },
            };
        },
        {
            detail: {
                tags: ['summaries'],
                summary: 'Get tournament summary',
                description: 'Returns a comprehensive summary of a tournament',
                responses: {
                    200: {
                        description: 'Tournament summary',
                    },
                    404: {
                        description: 'Tournament not found',
                    },
                },
            },
            params: t.Object({
                id: t.String(),
            }),
        },
    );
