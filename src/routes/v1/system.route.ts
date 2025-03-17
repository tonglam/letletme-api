import { Elysia, t } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { SystemService } from '../../services/system.service';

export const systemRoutes = new Elysia()
    .use(errorHandler)
    .get(
        '/health',
        async () => {
            const healthStatus = await SystemService.checkHealth();
            return healthStatus;
        },
        {
            response: t.Object({
                status: t.String(),
                timestamp: t.String(),
                services: t.Object({
                    database: t.String(),
                    dataRedis: t.String(),
                    cacheRedis: t.String(),
                }),
            }),
            detail: {
                tags: ['system'],
                summary: 'Health check endpoint',
                description: 'Check the health of the API and its dependencies',
            },
        },
    )
    .get('/version', () => SystemService.getVersion(), {
        response: t.Object({
            name: t.String(),
            version: t.String(),
            environment: t.String(),
        }),
        detail: {
            tags: ['system'],
            summary: 'API version information',
            description: 'Returns information about the API version',
        },
    });
