import { staticPlugin } from '@elysiajs/static';
import { swagger } from '@elysiajs/swagger';
import 'dotenv/config';
import { Elysia } from 'elysia';
import { HttpStatusCode } from 'elysia-http-status-code';
import { logger } from './config/logger';
import { database } from './db';
import { httpLoggerMiddleware } from './middlewares/httpLogger';
import { redis } from './redis';
import { v1Routes } from './routes/v1';

// Initialize connections
const initConnections = async (): Promise<void> => {
    // Initialize Redis connection
    redis.getClient();
    logger.info('Redis connection initialized');

    // Check database connection
    const dbConnected = await database.checkConnection();
    if (dbConnected) {
        logger.info('Database connection initialized');
    } else {
        logger.error('Failed to connect to database');
        process.exit(1);
    }
};

// Initialize connections before starting the server
initConnections().then(() => {
    // Create the main application
    const app = new Elysia()
        .use(
            swagger({
                documentation: {
                    info: {
                        title: 'LetLetMe API',
                        version: '1.0.0',
                        description: 'API for LetLetMe application',
                    },
                    tags: [
                        { name: 'common', description: 'Common endpoints' },
                        { name: 'entry', description: 'Match entry endpoints' },
                        { name: 'live', description: 'Live match endpoints' },
                        { name: 'player', description: 'Player endpoints' },
                        { name: 'stat', description: 'Statistics endpoints' },
                        { name: 'summary', description: 'Summary endpoints' },
                        {
                            name: 'tournament',
                            description: 'Tournament endpoints',
                        },
                    ],
                },
            }),
        )
        // Add static file serving for public directory
        .use(
            staticPlugin({
                assets: './public',
                prefix: '',
            }),
        )
        // Add HTTP status code plugin
        .use(HttpStatusCode())
        // Add HTTP logger middleware
        .use(httpLoggerMiddleware)
        .get('/', ({ set }) => {
            set.headers['Content-Type'] = 'text/html';
            return Bun.file('./public/index.html');
        })
        // Mount the v1 API routes
        .use(v1Routes)
        .listen(process.env.API_PORT ?? 3000);

    logger.info(
        `🦊 LetLetMe API is running at ${app.server?.hostname}:${app.server?.port}`,
    );
});

// Handle application shutdown
const gracefulShutdown = async (): Promise<void> => {
    logger.info('Shutting down...');

    try {
        // Close Redis connection
        await redis.close();
        logger.info('Redis connection closed');

        // Close database connection
        await database.closeDbConnection();
        logger.info('Database connection closed');
    } catch (error) {
        logger.error('Error during shutdown', { error });
    }

    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
