import { Elysia } from 'elysia';
import { entryRoutes } from './entry.route';
import { eventRoutes } from './event.route';
import { fixtureRoutes } from './fixture.route';
import { leagueRoutes } from './league.route';
import { liveRoutes } from './live.route';
import { noticeRoutes } from './notice.route';
import { playerRoutes } from './player.route';
import { statisticRoutes } from './statistic.route';
import { summaryRoutes } from './summary.route';
import { systemRoutes } from './system.route';
import { teamRoutes } from './team.route';
import { tournamentRoutes } from './tournament.route';

// Create a versioned API router that combines all route groups
export const v1Routes = new Elysia({ prefix: '/v1' })
    .use(systemRoutes)
    .use(entryRoutes)
    .use(eventRoutes)
    .use(fixtureRoutes)
    .use(leagueRoutes)
    .use(liveRoutes)
    .use(noticeRoutes)
    .use(playerRoutes)
    .use(statisticRoutes)
    .use(summaryRoutes)
    .use(teamRoutes)
    .use(tournamentRoutes);
