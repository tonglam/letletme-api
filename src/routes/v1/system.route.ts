import { Elysia, t } from 'elysia';
import { database } from '../../db';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { redis } from '../../redis';

export const systemRoutes = new Elysia()
    .use(errorHandler)
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
            response: t.Object({
                status: t.String(),
                timestamp: t.String(),
                services: t.Object({
                    database: t.String(),
                    redis: t.String(),
                }),
            }),
            detail: {
                tags: ['system'],
                summary: 'Health check endpoint',
                description: 'Check the health of the API and its dependencies',
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
            response: t.Object({
                name: t.String(),
                version: t.String(),
            }),
            detail: {
                tags: ['system'],
                summary: 'API version information',
                description: 'Returns information about the API version',
            },
        },
    );
