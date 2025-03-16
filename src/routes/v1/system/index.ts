import { Elysia, t } from 'elysia';
import { database } from '../../../db';
import { redis } from '../../../redis';

export const systemRoutes = new Elysia()
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
                tags: ['system'],
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
            };
        },
        {
            detail: {
                tags: ['system'],
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
