import { Elysia, NotFoundError, t } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { SummaryService } from '../../services';

export const summaryRoutes = new Elysia({ prefix: '/summaries' })
    .use(errorHandler)
    // Get tournament summary
    .get(
        '/tournaments/:id',
        async ({ params }) => {
            const summary = await SummaryService.getTournamentSummary(
                params.id,
            );
            if (!summary) throw new NotFoundError();
            return summary;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['summaries'],
                summary: 'Get tournament summary',
                description: 'Returns a comprehensive summary of a tournament',
            },
        },
    );
