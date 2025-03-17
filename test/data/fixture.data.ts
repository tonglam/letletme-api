import type {
    Fixture,
    NextGameweekFixture,
} from '../../src/types/fixture.type';

// Mock data
export const MOCK_SEASON = '2425';
export const MOCK_CURRENT_EVENT = 29;
export const MOCK_NEXT_EVENT = 30;

// Sample team data
export const MOCK_TEAM_NAMES: Record<string, string> = {
    '1': 'Arsenal',
    '2': 'Aston Villa',
    '3': 'Bournemouth',
    '4': 'Brentford',
};

export const MOCK_TEAM_SHORT_NAMES: Record<string, string> = {
    '1': 'ARS',
    '2': 'AVL',
    '3': 'BOU',
    '4': 'BRE',
};

// Sample fixture data
export const MOCK_FIXTURES: Fixture[] = [
    {
        id: 1,
        event: MOCK_NEXT_EVENT,
        team_h: 1,
        team_a: 2,
        team_h_score: undefined,
        team_a_score: undefined,
        kickoff_time: '2024-03-30T15:00:00Z',
        started: false,
        finished: false,
        difficulty: 4,
    },
    {
        id: 2,
        event: MOCK_NEXT_EVENT,
        team_h: 3,
        team_a: 4,
        team_h_score: undefined,
        team_a_score: undefined,
        kickoff_time: '2024-03-30T17:30:00Z',
        started: false,
        finished: false,
        difficulty: 3,
    },
];

// Expected transformed fixtures
export const EXPECTED_NEXT_GAMEWEEK_FIXTURES: NextGameweekFixture[] = [
    {
        event: MOCK_NEXT_EVENT,
        teamId: 1,
        teamName: 'Arsenal',
        teamShortName: 'ARS',
        againstTeamId: 2,
        againstTeamName: 'Aston Villa',
        againstTeamShortName: 'AVL',
        difficulty: 4,
        kickoffTime: '2024-03-30T15:00:00Z',
        started: false,
        finished: false,
        wasHome: true,
        teamScore: 0,
        againstTeamScore: 0,
        score: '0-0',
        result: '',
        bgw: false,
        dgw: false,
    },
    {
        event: MOCK_NEXT_EVENT,
        teamId: 2,
        teamName: 'Aston Villa',
        teamShortName: 'AVL',
        againstTeamId: 1,
        againstTeamName: 'Arsenal',
        againstTeamShortName: 'ARS',
        difficulty: 4,
        kickoffTime: '2024-03-30T15:00:00Z',
        started: false,
        finished: false,
        wasHome: false,
        teamScore: 0,
        againstTeamScore: 0,
        score: '0-0',
        result: '',
        bgw: false,
        dgw: false,
    },
    {
        event: MOCK_NEXT_EVENT,
        teamId: 3,
        teamName: 'Bournemouth',
        teamShortName: 'BOU',
        againstTeamId: 4,
        againstTeamName: 'Brentford',
        againstTeamShortName: 'BRE',
        difficulty: 3,
        kickoffTime: '2024-03-30T17:30:00Z',
        started: false,
        finished: false,
        wasHome: true,
        teamScore: 0,
        againstTeamScore: 0,
        score: '0-0',
        result: '',
        bgw: false,
        dgw: false,
    },
    {
        event: MOCK_NEXT_EVENT,
        teamId: 4,
        teamName: 'Brentford',
        teamShortName: 'BRE',
        againstTeamId: 3,
        againstTeamName: 'Bournemouth',
        againstTeamShortName: 'BOU',
        difficulty: 3,
        kickoffTime: '2024-03-30T17:30:00Z',
        started: false,
        finished: false,
        wasHome: false,
        teamScore: 0,
        againstTeamScore: 0,
        score: '0-0',
        result: '',
        bgw: false,
        dgw: false,
    },
];
