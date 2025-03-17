import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { eventRoutes } from '../../src/routes/v1/event.route';
import * as eventService from '../../src/services/event.service';
import { EXPECTED_SCORES, MOCK_EVENT_DEADLINES } from '../data/event.data';

describe('Event Routes', () => {
    // Spy on event service functions
    let getCurrentEventAndDeadlineSpy: ReturnType<typeof spyOn>;
    let getEventAverageScoresSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
        // Mock event service functions
        getCurrentEventAndDeadlineSpy = spyOn(
            eventService,
            'getCurrentEventAndDeadline',
        ).mockImplementation(async () => ({
            event: '3',
            utcDeadline: MOCK_EVENT_DEADLINES['4'],
        }));

        getEventAverageScoresSpy = spyOn(
            eventService,
            'getEventAverageScores',
        ).mockImplementation(async () => EXPECTED_SCORES);
    });

    afterEach(() => {
        // Restore original implementations
        getCurrentEventAndDeadlineSpy.mockRestore();
        getEventAverageScoresSpy.mockRestore();
    });

    describe('GET /events/current-with-deadline', () => {
        it('should return current event and deadline', async () => {
            const response = await eventRoutes
                .handle(
                    new Request(
                        'http://localhost/events/current-with-deadline',
                    ),
                )
                .then((res) => res.json());

            expect(response).toEqual({
                event: '3',
                utcDeadline: MOCK_EVENT_DEADLINES['4'],
            });
            expect(getCurrentEventAndDeadlineSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('GET /events/average-scores', () => {
        it('should return event average scores', async () => {
            const response = await eventRoutes
                .handle(new Request('http://localhost/events/average-scores'))
                .then((res) => res.json());

            expect(response).toEqual(EXPECTED_SCORES);
            expect(getEventAverageScoresSpy).toHaveBeenCalledTimes(1);
        });
    });
});
