import type {
    EventDeadline,
    EventScores,
    LeagueInfoData,
    PlayerFixtureData,
    TeamData,
} from '../../types/common.type';

/**
 * Common API service
 * Provides functionality for common operations across the application
 */
export class CommonService {
    /**
     * Query current event and next deadline
     * @returns Current event and next deadline information
     */
    static qryCurrentEventAndNextUtcDeadline(): EventDeadline {
        // Implementation will be added later
        return {
            currentEvent: '1',
            nextDeadline: '2024-03-20T00:00:00Z',
        };
    }

    /**
     * Refresh event and deadline data
     */
    static refreshEventAndDeadline(): void {
        // Implementation will be added later
    }

    /**
     * Insert event live cache
     * @param event Event ID
     */
    static insertEventLiveCache(event: number): void {
        // Implementation will be added later
        void event;
    }

    /**
     * Query event average score
     * @returns Map of event IDs to average scores
     */
    static qryEventAverageScore(): EventScores {
        // Implementation will be added later
        return { '1': 50 };
    }

    /**
     * Query team list for a season
     * @param season Season identifier
     * @returns List of teams
     */
    static qryTeamList(season: string): TeamData[] {
        // Implementation will be added later
        void season;
        return [];
    }

    /**
     * Query all league names for a season
     * @param season Season identifier
     * @returns List of league information
     */
    static qryAllLeagueName(season: string): LeagueInfoData[] {
        // Implementation will be added later
        void season;
        return [];
    }

    /**
     * Query next fixture for an event
     * @param event Event ID
     * @returns List of player fixtures
     */
    static qryNextFixture(event: number): PlayerFixtureData[] {
        // Implementation will be added later
        void event;
        return [];
    }

    /**
     * Query mini program notice
     * @returns Notice message
     */
    static qryMiniProgramNotice(): string {
        // Implementation will be added later
        return 'Welcome to the mini program!';
    }
}
