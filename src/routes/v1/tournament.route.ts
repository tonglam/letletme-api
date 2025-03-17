import { Elysia, NotFoundError, t } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { TournamentService } from '../../services';

export const tournamentRoutes = new Elysia({ prefix: '/tournaments' })
    .use(errorHandler)
    // Get all tournaments
    .get(
        '/',
        async () => {
            const tournaments = await TournamentService.getAllTournaments();
            if (!tournaments?.data || tournaments.data.length === 0)
                throw new NotFoundError();
            return tournaments;
        },
        {
            detail: {
                tags: ['tournaments'],
                summary: 'Get all tournaments',
                description: 'Returns a list of all tournaments',
            },
        },
    )
    // Get tournament by ID
    .get(
        '/:id',
        async ({ params }) => {
            const tournament = await TournamentService.getTournamentById(
                params.id,
            );
            if (!tournament) throw new NotFoundError();
            return tournament;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['tournaments'],
                summary: 'Get tournament by ID',
                description: 'Returns details of a specific tournament',
            },
        },
    )
    // Create new tournament
    .post(
        '/',
        async ({ body, set }) => {
            const tournament = await TournamentService.createTournament(body);
            set.status = 201;
            return tournament;
        },
        {
            body: t.Object({
                name: t.String(),
                startDate: t.String(),
                endDate: t.String(),
                venue: t.Optional(t.String()),
                location: t.Optional(t.String()),
                status: t.Optional(t.String({ default: 'upcoming' })),
            }),
            detail: {
                tags: ['tournaments'],
                summary: 'Create tournament',
                description: 'Creates a new tournament',
            },
        },
    )
    // Update tournament
    .put(
        '/:id',
        async ({ params, body }) => {
            const tournament = await TournamentService.updateTournament(
                params.id,
                body,
            );
            if (!tournament) throw new NotFoundError();
            return tournament;
        },
        {
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
            detail: {
                tags: ['tournaments'],
                summary: 'Update tournament',
                description: 'Updates an existing tournament',
            },
        },
    )
    // Delete tournament
    .delete(
        '/:id',
        async ({ params, set }) => {
            const deleted = await TournamentService.deleteTournament(params.id);
            if (!deleted) throw new NotFoundError();
            set.status = 204;
            return null;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['tournaments'],
                summary: 'Delete tournament',
                description: 'Deletes an existing tournament',
            },
        },
    );
