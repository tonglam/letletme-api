import { Elysia, t } from 'elysia';
import { HttpStatusCode } from 'elysia-http-status-code';

export const statisticRoutes = new Elysia({ prefix: '/statistics' })
    .use(HttpStatusCode())
    // Get tournament statistics
    .get(
        '/tournaments/:id',
        async ({ params }) => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                data: {
                    tournamentId: params.id,
                    matchesPlayed: 42,
                    matchesCompleted: 38,
                    matchesInProgress: 4,
                    totalPlayers: 64,
                    averageMatchDuration: 45, // minutes
                    longestMatch: {
                        id: 'match123',
                        duration: 120, // minutes
                        player1: 'Player A',
                        player2: 'Player B',
                        score: [21, 19, 23, 21],
                    },
                    highestScore: {
                        matchId: 'match456',
                        player: 'Player C',
                        score: 29,
                    },
                    mostAces: {
                        playerId: 'p12',
                        playerName: 'John Smith',
                        count: 15,
                    },
                },
            };
        },
        {
            detail: {
                tags: ['statistics'],
                summary: 'Get tournament statistics',
                description:
                    'Returns statistical data for a specific tournament',
                responses: {
                    200: {
                        description: 'Tournament statistics',
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
    )
    // Get player statistics
    .get(
        '/players/:id',
        async ({ params, query }) => {
            // Mock response - to be implemented with actual database queries
            const tournamentId = query.tournamentId as string | undefined;

            return {
                status: 'success',
                data: {
                    playerId: params.id,
                    tournamentId,
                    totalMatches: 15,
                    wins: 10,
                    losses: 5,
                    winRate: 0.67,
                    averagePointsPerMatch: 18.5,
                    highestScore: 25,
                    averageDuration: 42, // minutes
                    statistics: {
                        aces: 12,
                        doubleFaults: 5,
                        winnersCount: 45,
                        errorsCount: 32,
                        firstServePercentage: 0.72,
                    },
                    recentForm: ['W', 'W', 'L', 'W', 'W'],
                    headToHead: [
                        {
                            opponentId: 'p5',
                            opponentName: 'Jane Doe',
                            wins: 2,
                            losses: 1,
                        },
                        {
                            opponentId: 'p8',
                            opponentName: 'Bob Smith',
                            wins: 1,
                            losses: 0,
                        },
                    ],
                },
            };
        },
        {
            detail: {
                tags: ['statistics'],
                summary: 'Get player statistics',
                description: 'Returns statistical data for a specific player',
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
            query: t.Object({
                tournamentId: t.Optional(t.String()),
            }),
        },
    )
    // Get head-to-head statistics between two players
    .get(
        '/head-to-head',
        async ({ query }) => {
            // Mock response - to be implemented with actual database queries
            const player1Id = query.player1Id as string;
            const player2Id = query.player2Id as string;

            if (!player1Id || !player2Id) {
                return {
                    status: 'error',
                    message: 'Both player1Id and player2Id are required',
                };
            }

            return {
                status: 'success',
                data: {
                    player1: {
                        id: player1Id,
                        name: 'Player 1',
                    },
                    player2: {
                        id: player2Id,
                        name: 'Player 2',
                    },
                    matches: 8,
                    player1Wins: 5,
                    player2Wins: 3,
                    lastMatches: [
                        {
                            matchId: 'match1',
                            tournamentId: 't1',
                            tournamentName: 'Summer Open 2023',
                            date: '2023-06-15',
                            winner: player1Id,
                            score: [21, 18],
                        },
                        {
                            matchId: 'match2',
                            tournamentId: 't2',
                            tournamentName: 'Winter Cup 2023',
                            date: '2023-12-10',
                            winner: player2Id,
                            score: [19, 21, 15, 21],
                        },
                        {
                            matchId: 'match3',
                            tournamentId: 't3',
                            tournamentName: 'Spring Championship 2024',
                            date: '2024-03-20',
                            winner: player1Id,
                            score: [21, 19, 21, 18],
                        },
                    ],
                    averageScoreDifference: 3.5,
                    averageMatchDuration: 48, // minutes
                },
            };
        },
        {
            detail: {
                tags: ['stat'],
                summary: 'Get head-to-head statistics',
                description:
                    'Returns head-to-head statistical data between two players',
                responses: {
                    200: {
                        description: 'Head-to-head statistics',
                    },
                    400: {
                        description: 'Missing player IDs',
                    },
                },
            },
            query: t.Object({
                player1Id: t.String(),
                player2Id: t.String(),
                tournamentId: t.Optional(t.String()),
            }),
        },
    )
    // Get player rankings
    .get(
        '/rankings',
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
                        rank: i + offset + 1,
                        playerId: `p${i + offset + 1}`,
                        playerName: `Player ${i + offset + 1}`,
                        country: i % 3 === 0 ? 'US' : i % 3 === 1 ? 'UK' : 'JP',
                        points: 5000 - (i + offset) * 100,
                        previousRank: i + offset + 2,
                        tournaments: 15 - (i % 5),
                        bestResult:
                            i === 0
                                ? 'Winner'
                                : i === 1
                                  ? 'Finalist'
                                  : 'Semi-finalist',
                    })),
            };
        },
        {
            detail: {
                tags: ['stat'],
                summary: 'Get player rankings',
                description: 'Returns the current player rankings',
                responses: {
                    200: {
                        description: 'Player rankings',
                    },
                },
            },
            query: t.Object({
                limit: t.Optional(t.String()),
                offset: t.Optional(t.String()),
                country: t.Optional(t.String()),
            }),
        },
    );
