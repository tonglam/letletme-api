import { Elysia } from 'elysia';
import { entryRoutes as matchRoutes } from './entries/index';
import { eventRoutes } from './events/index';
import { fixtureRoutes } from './fixtures/index';
import { leagueRoutes } from './leagues/index';
import { liveRoutes } from './live/index';
import { noticeRoutes } from './notices/index';
import { playerRoutes } from './players/index';
import { statRoutes as statisticsRoutes } from './statistics/index';
import { summaryRoutes as summariesRoutes } from './summaries/index';
import { systemRoutes } from './system/index';
import { teamRoutes } from './teams/index';
import { tournamentRoutes } from './tournaments/index';

// Create a versioned API router that combines all route groups
export const v1Routes = new Elysia({ prefix: '/v1' })
    .use(systemRoutes)
    .use(matchRoutes)
    .use(eventRoutes)
    .use(fixtureRoutes)
    .use(leagueRoutes)
    .use(liveRoutes)
    .use(noticeRoutes)
    .use(playerRoutes)
    .use(statisticsRoutes)
    .use(summariesRoutes)
    .use(teamRoutes)
    .use(tournamentRoutes);
