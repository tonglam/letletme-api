import { Elysia, t } from 'elysia';
import { CommonService } from '../../../services/common';

export const noticeRoutes = new Elysia({ prefix: '/notices' }).get(
    '/mini-program',
    () => CommonService.qryMiniProgramNotice(),
    {
        response: t.String(),
        detail: {
            tags: ['notices'],
            summary: 'Get mini program notice',
            description: 'Returns the notice for the mini program',
            responses: {
                200: {
                    description: 'Mini program notice',
                },
            },
        },
    },
);
