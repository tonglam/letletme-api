import { Elysia, t } from 'elysia';
import { HttpStatusCode } from 'elysia-http-status-code';

export const tournamentRoutes = new Elysia({ prefix: '/tournaments' })
    .use(HttpStatusCode())
    // Get all tournaments
    .get(
        '/',
        async () => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                data: [
                    {
                        id: '1',
                        name: 'Summer Championship 2023',
                        startDate: '2023-06-15',
                        endDate: '2023-06-30',
                        status: 'completed',
                    },
                    {
                        id: '2',
                        name: 'Winter Cup 2024',
                        startDate: '2024-01-10',
                        endDate: '2024-01-25',
                        status: 'active',
                    },
                ],
            };
        },
        {
            detail: {
                tags: ['tournaments'],
                summary: 'Get all tournaments',
                description: 'Returns a list of all tournaments',
                responses: {
                    200: {
                        description: 'List of tournaments',
                    },
                },
            },
        },
    )
    // Get tournament by ID
    .get(
        '/:id',
        async ({ params }) => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                data: {
                    id: params.id,
                    name: 'Summer Championship 2023',
                    startDate: '2023-06-15',
                    endDate: '2023-06-30',
                    status: 'completed',
                    venue: 'Sports Arena',
                    location: 'New York, NY',
                    participants: 32,
                },
            };
        },
        {
            detail: {
                tags: ['tournaments'],
                summary: 'Get tournament by ID',
                description: 'Returns details of a specific tournament',
                responses: {
                    200: {
                        description: 'Tournament details',
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
    // Create new tournament
    .post(
        '/',
        async ({ body, set }) => {
            // Mock response - to be implemented with actual database queries
            set.status = 201;
            return {
                status: 'success',
                message: 'Tournament created successfully',
                data: {
                    id: '3',
                    ...body,
                },
            };
        },
        {
            detail: {
                tags: ['tournaments'],
                summary: 'Create tournament',
                description: 'Creates a new tournament',
                responses: {
                    201: {
                        description: 'Tournament created successfully',
                    },
                    400: {
                        description: 'Invalid input',
                    },
                },
            },
            body: t.Object({
                name: t.String(),
                startDate: t.String(),
                endDate: t.String(),
                venue: t.Optional(t.String()),
                location: t.Optional(t.String()),
                status: t.Optional(t.String({ default: 'upcoming' })),
            }),
        },
    )
    // Update tournament
    .put(
        '/:id',
        async ({ params, body }) => {
            // Mock response - to be implemented with actual database queries
            return {
                status: 'success',
                message: 'Tournament updated successfully',
                data: {
                    id: params.id,
                    ...body,
                },
            };
        },
        {
            detail: {
                tags: ['tournaments'],
                summary: 'Update tournament',
                description: 'Updates an existing tournament',
                responses: {
                    200: {
                        description: 'Tournament updated successfully',
                    },
                    404: {
                        description: 'Tournament not found',
                    },
                    400: {
                        description: 'Invalid input',
                    },
                },
            },
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                name: t.Optional(t.String()),
                startDate: t.Optional(t.String()),
                endDate: t.Optional(t.String()),
                venue: t.Optional(t.String()),
                location: t.Optional(t.String()),
                status: t.Optional(t.String()),
            }),
        },
    )
    // Delete tournament
    .delete(
        '/:id',
        async ({ params, set }) => {
            // Mock implementation - actually delete the tournament with ID params.id
            console.log(`Deleting tournament with ID: ${params.id}`);
            set.status = 204;
            return null;
        },
        {
            detail: {
                tags: ['tournaments'],
                summary: 'Delete tournament',
                description: 'Deletes an existing tournament',
                responses: {
                    204: {
                        description: 'Tournament deleted successfully',
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
    );
