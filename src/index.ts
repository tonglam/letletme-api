import { staticPlugin } from '@elysiajs/static';
import { swagger } from '@elysiajs/swagger';
import 'dotenv/config';
import { Elysia } from 'elysia';
import { HttpStatusCode } from 'elysia-http-status-code';
import { logger } from './config/logger.config';
import { database } from './db';
import { httpLoggerPlugin } from './plugins/http-logger.plugin';
import { cacheRedis, dataRedis } from './redis';
import { v1Routes } from './routes/v1';

// Initialize connections
const initConnections = async (): Promise<void> => {
    try {
        // Initialize Redis connections
        await dataRedis.ping();
        logger.info('Data Redis connection initialized');

        await cacheRedis.ping();
        logger.info('Cache Redis connection initialized');

        // Check database connection
        const dbConnected = await database.checkConnection();
        if (dbConnected) {
            logger.info('Database connection initialized');
        } else {
            throw new Error('Failed to connect to database');
        }
    } catch (err) {
        logger.error({ err }, 'Failed to initialize connections');
        process.exit(1);
    }
};

// Initialize connections before starting the server
initConnections().then(() => {
    // Create the main application
    const app = new Elysia()
        // Add HTTP logger middleware first
        .use(httpLoggerPlugin)
        .use(
            swagger({
                documentation: {
                    info: {
                        title: 'LetLetMe API',
                        version: '1.0.0',
                        description: 'API for LetLetMe application',
                    },
                    tags: [
                        { name: 'system', description: 'System endpoints' },
                        { name: 'matches', description: 'Match endpoints' },
                        { name: 'events', description: 'Event endpoints' },
                        { name: 'fixtures', description: 'Fixture endpoints' },
                        { name: 'leagues', description: 'League endpoints' },
                        { name: 'live', description: 'Live match endpoints' },
                        { name: 'notices', description: 'Notice endpoints' },
                        { name: 'players', description: 'Player endpoints' },
                        {
                            name: 'statistics',
                            description: 'Statistics endpoints',
                        },
                        { name: 'summaries', description: 'Summary endpoints' },
                        { name: 'teams', description: 'Team endpoints' },
                        {
                            name: 'tournaments',
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
        // Close Redis connections
        await dataRedis.close();
        logger.info('Data Redis connection closed');

        await cacheRedis.close();
        logger.info('Cache Redis connection closed');

        // Close database connection
        await database.closeDbConnection();
        logger.info('Database connection closed');
    } catch (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
    }

    process.exit(0);
};

// Handle process signals for graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
