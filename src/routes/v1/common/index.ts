import { Elysia, t } from 'elysia';
import { database } from '../../../db';
import { redis } from '../../../redis';
import { CommonService } from '../../../services/common';
import {
    EventDeadline,
    EventScores,
    LeagueInfoData,
    PlayerFixtureData,
    TeamData,
} from '../../../types/common.type';

export const commonRoutes = new Elysia({ prefix: '/common' })
    .get(
        '/qryCurrentEventAndNextUtcDeadline',
        () => CommonService.qryCurrentEventAndNextUtcDeadline(),
        {
            response: EventDeadline,
            detail: {
                tags: ['common'],
                summary: 'Get current event and next deadline',
                description:
                    'Returns information about the current event and the next UTC deadline',
                responses: {
                    200: {
                        description: 'Current event and deadline information',
                    },
                },
            },
        },
    )

    .get(
        '/refreshEventAndDeadline',
        () => CommonService.refreshEventAndDeadline(),
        {
            response: t.Void(),
            detail: {
                tags: ['common'],
                summary: 'Refresh event and deadline',
                description:
                    'Refreshes the current event and deadline information',
                responses: {
                    200: {
                        description:
                            'Event and deadline refreshed successfully',
                    },
                },
            },
        },
    )

    .get(
        '/insertEventLiveCache',
        ({ query }) => CommonService.insertEventLiveCache(query.event),
        {
            query: t.Object({
                event: t.Number(),
            }),
            response: t.Void(),
            detail: {
                tags: ['common'],
                summary: 'Insert event live cache',
                description: 'Inserts live cache data for a specific event',
                responses: {
                    200: {
                        description: 'Event live cache inserted successfully',
                    },
                },
            },
        },
    )

    .get('/qryEventAverageScore', () => CommonService.qryEventAverageScore(), {
        response: EventScores,
        detail: {
            tags: ['common'],
            summary: 'Get event average scores',
            description: 'Returns average scores for events',
            responses: {
                200: {
                    description: 'Event average scores',
                },
            },
        },
    })

    .get(
        '/qryTeamList',
        ({ query }) => CommonService.qryTeamList(query.season),
        {
            query: t.Object({
                season: t.String(),
            }),
            response: t.Array(TeamData),
            detail: {
                tags: ['common'],
                summary: 'Get team list',
                description: 'Returns a list of teams for a specific season',
                responses: {
                    200: {
                        description: 'List of teams',
                    },
                },
            },
        },
    )

    .get(
        '/qryAllLeagueName',
        ({ query }) => CommonService.qryAllLeagueName(query.season),
        {
            query: t.Object({
                season: t.String(),
            }),
            response: t.Array(LeagueInfoData),
            detail: {
                tags: ['common'],
                summary: 'Get all league names',
                description:
                    'Returns a list of all league names for a specific season',
                responses: {
                    200: {
                        description: 'List of league names',
                    },
                },
            },
        },
    )

    .get(
        '/qryNextFixture',
        ({ query }) => CommonService.qryNextFixture(query.event),
        {
            query: t.Object({
                event: t.Number(),
            }),
            response: t.Array(PlayerFixtureData),
            detail: {
                tags: ['common'],
                summary: 'Get next fixture',
                description:
                    'Returns information about the next fixture for a specific event',
                responses: {
                    200: {
                        description: 'Next fixture information',
                    },
                },
            },
        },
    )

    .get('/qryMiniProgramNotice', () => CommonService.qryMiniProgramNotice(), {
        response: t.String(),
        detail: {
            tags: ['common'],
            summary: 'Get mini program notice',
            description: 'Returns the notice for the mini program',
            responses: {
                200: {
                    description: 'Mini program notice',
                },
            },
        },
    })
    .get(
        '/health',
        async () => {
            const dbStatus = await database.checkConnection();
            const redisStatus = redis.getClient().status === 'ready';

            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                services: {
                    database: dbStatus ? 'healthy' : 'unhealthy',
                    redis: redisStatus ? 'healthy' : 'unhealthy',
                },
            };
        },
        {
            detail: {
                tags: ['common'],
                summary: 'Health check endpoint',
                description: 'Check the health of the API and its dependencies',
                responses: {
                    200: {
                        description: 'Health status of the API',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    status: t.String(),
                                    timestamp: t.String(),
                                    services: t.Object({
                                        database: t.String(),
                                        redis: t.String(),
                                    }),
                                }),
                            },
                        },
                    },
                },
            },
        },
    )
    .get(
        '/version',
        () => {
            return {
                name: 'LetLetMe API',
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
            };
        },
        {
            detail: {
                tags: ['common'],
                summary: 'API version information',
                description: 'Returns information about the API version',
                responses: {
                    200: {
                        description: 'API version details',
                        content: {
                            'application/json': {
                                schema: t.Object({
                                    name: t.String(),
                                    version: t.String(),
                                    environment: t.String(),
                                }),
                            },
                        },
                    },
                },
            },
        },
    );
