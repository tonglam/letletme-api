export interface GetAllPlayersParams {
    limit: number;
    offset: number;
    search?: string;
    country?: string;
}

export interface Player {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
    profileImage?: string;
    rating: number;
}

export interface PlayerStats {
    playerId: string;
    tournamentCount: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    averageScore: number;
    highestScore: number;
    recentForm: Array<'W' | 'L'>;
}
