import { swagger } from '@elysiajs/swagger';
import 'dotenv/config';
import { Elysia } from 'elysia';
import { database } from './db';
import { redis } from './redis/client';

// Initialize connections
const initConnections = async () => {
    // Initialize Redis connection
    redis.getClient();
    console.log('Redis connection initialized');

    // Check database connection
    const dbConnected = await database.checkConnection();
    if (dbConnected) {
        console.log('Database connection initialized');
    } else {
        console.error('Failed to connect to database');
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
                    ],
                },
            }),
        )
        .get('/', () => ({
            message: 'Welcome to LetLetMe API',
            version: '1.0.0',
            docs: '/swagger',
        }))
        .listen(process.env.API_PORT ?? 3000);

    console.log(
        `🦊 LetLetMe API is running at ${app.server?.hostname}:${app.server?.port}`,
    );
});

// Handle application shutdown
const gracefulShutdown = async () => {
    console.log('Shutting down...');

    try {
        // Close Redis connection
        await redis.close();
        console.log('Redis connection closed');

        // Close database connection
        await database.closeDbConnection();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error during shutdown:', error);
    }

    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
