import { bearer } from '@elysiajs/bearer';
import { swagger } from '@elysiajs/swagger';
import 'dotenv/config';
import { Elysia } from 'elysia';

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
    .use(bearer())
    .get('/', () => ({
        message: 'Welcome to LetLetMe API',
        version: '1.0.0',
        docs: '/swagger',
    }))
    .listen(process.env.API_PORT ?? 3000);

console.log(
    `🦊 LetLetMe API is running at ${app.server?.hostname}:${app.server?.port}`,
);
