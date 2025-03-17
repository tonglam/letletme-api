import { Elysia, NotFoundError, t } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { EntryService } from '../../services';

export const entryRoutes = new Elysia({ prefix: '/entries' })
    .use(errorHandler)
    // Get all matches
    .get(
        '/',
        async ({ query }) => {
            const entries = await EntryService.getAllMatches(
                query.limit ? parseInt(query.limit) : 20,
                query.offset ? parseInt(query.offset) : 0,
                query.tournamentId,
                query.playerId,
                query.status,
                query.round ? parseInt(query.round) : undefined,
            );
            if (!entries?.data || entries.data.length === 0)
                throw new NotFoundError();
            return entries;
        },
        {
            query: t.Object({
                limit: t.Optional(t.String()),
                offset: t.Optional(t.String()),
                tournamentId: t.Optional(t.String()),
                playerId: t.Optional(t.String()),
                status: t.Optional(t.String()),
                round: t.Optional(t.String()),
            }),
            detail: {
                tags: ['entries'],
                summary: 'Get all entries',
                description: 'Returns a paginated list of all entries',
            },
        },
    )
    // Get match entry by ID
    .get(
        '/:id',
        async ({ params }) => {
            const entry = await EntryService.getMatchById(params.id);
            if (!entry) throw new NotFoundError();
            return entry;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['entries'],
                summary: 'Get entry by ID',
                description: 'Returns details of a specific entry',
            },
        },
    )
    // Create new match
    .post(
        '/',
        async ({ body, set }) => {
            const entry = await EntryService.createMatch(body);
            set.status = 201;
            return entry;
        },
        {
            body: t.Object({
                tournamentId: t.String(),
                player1Id: t.String(),
                player2Id: t.String(),
                round: t.Number(),
                court: t.Optional(t.Number()),
                scheduledTime: t.String(),
                status: t.Optional(t.String({ default: 'scheduled' })),
            }),
            detail: {
                tags: ['entries'],
                summary: 'Create entry',
                description: 'Creates a new entry',
            },
        },
    )
    // Update match
    .put(
        '/:id',
        async ({ params, body }) => {
            const entry = await EntryService.updateMatch(params.id, body);
            if (!entry) throw new NotFoundError();
            return entry;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                tournamentId: t.Optional(t.String()),
                player1Id: t.Optional(t.String()),
                player2Id: t.Optional(t.String()),
                score: t.Optional(t.Array(t.Number())),
                round: t.Optional(t.Number()),
                court: t.Optional(t.Number()),
                scheduledTime: t.Optional(t.String()),
                actualStartTime: t.Optional(t.String()),
                duration: t.Optional(t.Number()),
                status: t.Optional(t.String()),
                winner: t.Optional(t.String()),
                referee: t.Optional(t.String()),
            }),
            detail: {
                tags: ['entries'],
                summary: 'Update entry',
                description: 'Updates an existing entry',
            },
        },
    )
    // Update match score
    .patch(
        '/:id/score',
        async ({ params, body }) => {
            const entry = await EntryService.updateMatchScore(params.id, body);
            if (!entry) throw new NotFoundError();
            return entry;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                score: t.Array(t.Number()),
                status: t.Optional(t.String()),
                winner: t.Optional(t.String()),
            }),
            detail: {
                tags: ['entries'],
                summary: 'Update entry score',
                description: 'Updates the score for an existing entry',
            },
        },
    )
    // Delete match
    .delete(
        '/:id',
        async ({ params, set }) => {
            const deleted = await EntryService.deleteMatch(params.id);
            if (!deleted) throw new NotFoundError();
            set.status = 204;
            return null;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['entries'],
                summary: 'Delete entry',
                description: 'Deletes an existing entry',
            },
        },
    );
