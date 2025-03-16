import { eventConfig } from '../../src/config/event';
import type { EventScores } from '../../src/types/event.type';

// Mock data
export const MOCK_SEASON = '2425';
export const MOCK_REDIS_KEY = `${eventConfig.redis.overallResultPrefix}${MOCK_SEASON}`;
export const MOCK_CACHE_KEY = eventConfig.cache.averageScoresKey;
export const MOCK_EVENT_DEADLINE_KEY = `${eventConfig.redis.keyPrefix}${MOCK_SEASON}`;

// Sample EventOverall data format
export const MOCK_EVENT_DATA = {
    '1': JSON.stringify([
        'com.tong.fpl.domain.letletme.event.EventOverallResultData',
        {
            event: 1,
            averageEntryScore: 57,
            finished: true,
            highestScoringEntry: 1234567,
            highestScore: 132,
        },
    ]),
    '2': JSON.stringify([
        'com.tong.fpl.domain.letletme.event.EventOverallResultData',
        {
            event: 2,
            averageEntryScore: 69,
            finished: true,
            highestScoringEntry: 9442126,
            highestScore: 154,
        },
    ]),
    '3': JSON.stringify([
        'com.tong.fpl.domain.letletme.event.EventOverallResultData',
        {
            event: 3,
            averageEntryScore: 64,
            finished: true,
            highestScoringEntry: 8765432,
            highestScore: 145,
        },
    ]),
    '10': JSON.stringify([
        'com.tong.fpl.domain.letletme.event.EventOverallResultData',
        {
            event: 10,
            averageEntryScore: 39,
            finished: true,
            highestScoringEntry: 5678901,
            highestScore: 110,
        },
    ]),
    '20': JSON.stringify([
        'com.tong.fpl.domain.letletme.event.EventOverallResultData',
        {
            event: 20,
            averageEntryScore: 60,
            finished: true,
            highestScoringEntry: 3456789,
            highestScore: 138,
        },
    ]),
    invalid: 'not-json',
    'no-score': JSON.stringify({ someOtherField: 123 }),
};

// Sample Event deadline data
export const MOCK_EVENT_DEADLINES = {
    '1': '2023-08-11T18:00:00Z',
    '2': '2023-08-18T18:00:00Z',
    '3': '2023-08-25T18:00:00Z',
    '4': '2023-09-01T18:00:00Z',
    '5': '2023-09-15T18:00:00Z',
    '38': '2024-05-19T14:00:00Z',
};

export const EXPECTED_SCORES: EventScores = {
    '1': 57,
    '2': 69,
    '3': 64,
    '10': 39,
    '20': 60,
};
