import { swagger } from '@elysiajs/swagger';
import 'dotenv/config';
import { Elysia, t } from 'elysia';
import { HttpStatusCode } from 'elysia-http-status-code';
import { auth } from './auth';
import { logger } from './config/logger';
import { database } from './db';
import {
    betterAuthView,
    linkAnonymousAccount,
    userMiddleware,
} from './middlewares/betterAuth';
import { httpLoggerMiddleware } from './middlewares/httpLogger';
import { redis } from './redis/client';
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
                        { name: 'users', description: 'User endpoints' },
                        { name: 'posts', description: 'Post endpoints' },
                        { name: 'comments', description: 'Comment endpoints' },
                        {
                            name: 'auth',
                            description: 'Authentication endpoints',
                        },
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
        // Add HTTP status code plugin
        .use(HttpStatusCode())
        // Add HTTP logger middleware
        .use(httpLoggerMiddleware)
        // Add user middleware to provide session and user information
        .derive(async ({ request }) => userMiddleware(request))
        // Mount Better Auth handler
        .all('/api/auth/*', betterAuthView)
        // Anonymous authentication endpoint
        .post(
            '/api/auth/anonymous',
            async () => {
                try {
                    const { user, session } = await auth.api.signInAnonymous();
                    return {
                        status: 'success',
                        user,
                        session: {
                            id: session.id,
                            expires: session.expires,
                        },
                    };
                } catch (error: unknown) {
                    logger.error('Anonymous authentication error', { error });
                    return {
                        status: 'error',
                        message: 'Failed to create anonymous user',
                    };
                }
            },
            {
                detail: {
                    tags: ['auth'],
                    summary: 'Sign in anonymously',
                    description:
                        'Creates an anonymous user and returns a session',
                },
            },
        )
        // Link anonymous account to a regular account
        .post(
            '/api/auth/link-anonymous',
            async ({ body, user }) => {
                if (!user || !user.isAnonymous) {
                    return {
                        status: 'error',
                        message: 'Not authenticated as anonymous user',
                    };
                }

                try {
                    const newUser = await auth.createUser(
                        body as Partial<typeof user>,
                    );
                    await linkAnonymousAccount(user.id, newUser);

                    return {
                        status: 'success',
                        message: 'Anonymous account linked successfully',
                        user: newUser,
                    };
                } catch (error: unknown) {
                    logger.error('Error linking anonymous account', { error });
                    return {
                        status: 'error',
                        message: 'Failed to link anonymous account',
                    };
                }
            },
            {
                detail: {
                    tags: ['auth'],
                    summary: 'Link anonymous account',
                    description:
                        'Links an anonymous account to a regular account',
                },
                body: t.Object({
                    name: t.Optional(t.String()),
                    email: t.Optional(t.String()),
                }),
            },
        )
        .get('/', () => ({
            message: 'Welcome to LetLetMe API',
            version: '1.0.0',
            docs: '/swagger',
        }))
        // Protected route example
        .get(
            '/api/protected',
            ({ user }) => {
                if (!user) {
                    return {
                        status: 'error',
                        message: 'Authentication required',
                    };
                }

                return {
                    status: 'success',
                    message: 'You are authenticated',
                    user,
                };
            },
            {
                detail: {
                    tags: ['auth'],
                    summary: 'Protected route example',
                    description:
                        'Example of a route that requires authentication',
                },
            },
        )
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
