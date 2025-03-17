import { Elysia, NotFoundError } from 'elysia';
import { errorHandler } from '../../plugins/error-handler.plugin';
import * as fixtureService from '../../services/fixture.service';
import { NextGameweekFixture } from '../../types/fixture.type';

export const fixtureRoutes = new Elysia({ prefix: '/fixtures' })
    .use(errorHandler)
    .get(
        '/next-gameweek',
        async () => {
            const fixtures = await fixtureService.getNextGameweekFixtures();
            if (!fixtures || fixtures.length === 0) throw new NotFoundError();
            return fixtures;
        },
        {
            response: [NextGameweekFixture],
            detail: {
                tags: ['fixtures'],
                summary: 'Get next gameweek fixtures',
                description:
                    'Returns fixtures for the next gameweek with team information',
            },
        },
    );
