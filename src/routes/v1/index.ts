import { Elysia } from 'elysia';
import { commonRoutes } from './common/index';
import { entryRoutes } from './entry/index';
import { liveRoutes } from './live/index';
import { playerRoutes } from './player/index';
import { statRoutes } from './stat/index';
import { summaryRoutes } from './summary/index';
import { tournamentRoutes } from './tournament/index';

// Create a versioned API router that combines all route groups
export const v1Routes = new Elysia({ prefix: '/v1' })
    .use(commonRoutes)
    .use(entryRoutes)
    .use(liveRoutes)
    .use(playerRoutes)
    .use(statRoutes)
    .use(summaryRoutes)
    .use(tournamentRoutes);
