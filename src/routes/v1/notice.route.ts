import { Elysia, NotFoundError, t } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import { NoticeService } from '../../services';

export const noticeRoutes = new Elysia({ prefix: '/notices' })
    .use(errorHandler)
    .get(
        '/mini-program',
        async () => {
            const notice = await NoticeService.getMiniProgramNotice();
            if (!notice) throw new NotFoundError();
            return notice;
        },
        {
            response: t.String(),
            detail: {
                tags: ['notices'],
                summary: 'Get mini program notice',
                description: 'Returns the notice for the mini program',
            },
        },
    );
