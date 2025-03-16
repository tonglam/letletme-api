import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { eventRoutes } from '../../src/routes/v1/event.route';
import * as eventService from '../../src/services/event.service';
import { EXPECTED_SCORES, MOCK_EVENT_DEADLINES } from '../data/event.data';

describe('Event Routes', () => {
    // Spy on event service functions
    let getCurrentEventAndDeadlineSpy: ReturnType<typeof spyOn>;
    let refreshEventAndDeadlineSpy: ReturnType<typeof spyOn>;
    let insertEventLiveCacheSpy: ReturnType<typeof spyOn>;
    let getEventAverageScoresSpy: ReturnType<typeof spyOn>;
    let refreshEventAverageScoresSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
        // Mock event service functions
        getCurrentEventAndDeadlineSpy = spyOn(
            eventService,
            'getCurrentEventAndDeadline',
        ).mockImplementation(async () => ({
            currentEvent: '3',
            nextDeadline: MOCK_EVENT_DEADLINES['4'],
        }));

        refreshEventAndDeadlineSpy = spyOn(
            eventService,
            'refreshEventAndDeadline',
        ).mockImplementation(async () => {});

        insertEventLiveCacheSpy = spyOn(
            eventService,
            'insertEventLiveCache',
        ).mockImplementation(async () => {});

        getEventAverageScoresSpy = spyOn(
            eventService,
            'getEventAverageScores',
        ).mockImplementation(async () => EXPECTED_SCORES);

        refreshEventAverageScoresSpy = spyOn(
            eventService,
            'refreshEventAverageScores',
        ).mockImplementation(async () => {});
    });

    afterEach(() => {
        // Restore original implementations
        getCurrentEventAndDeadlineSpy.mockRestore();
        refreshEventAndDeadlineSpy.mockRestore();
        insertEventLiveCacheSpy.mockRestore();
        getEventAverageScoresSpy.mockRestore();
        refreshEventAverageScoresSpy.mockRestore();
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
                currentEvent: '3',
                nextDeadline: MOCK_EVENT_DEADLINES['4'],
            });
            expect(getCurrentEventAndDeadlineSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('POST /events/refresh', () => {
        it('should refresh event and deadline', async () => {
            const response = await eventRoutes
                .handle(
                    new Request('http://localhost/events/refresh', {
                        method: 'POST',
                    }),
                )
                .then((res) => res.status);

            expect(response).toBe(200);
            expect(refreshEventAndDeadlineSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('POST /events/:event/cache', () => {
        it('should insert event live cache', async () => {
            const eventId = 3;
            const response = await eventRoutes
                .handle(
                    new Request(`http://localhost/events/${eventId}/cache`, {
                        method: 'POST',
                    }),
                )
                .then((res) => res.status);

            expect(response).toBe(200);
            expect(insertEventLiveCacheSpy).toHaveBeenCalledTimes(1);
            expect(insertEventLiveCacheSpy).toHaveBeenCalledWith(eventId);
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

    describe('POST /events/average-scores/refresh', () => {
        it('should refresh event average scores cache', async () => {
            const response = await eventRoutes
                .handle(
                    new Request(
                        'http://localhost/events/average-scores/refresh',
                        {
                            method: 'POST',
                        },
                    ),
                )
                .then((res) => res.status);

            expect(response).toBe(200);
            expect(refreshEventAverageScoresSpy).toHaveBeenCalledTimes(1);
        });
    });
});
