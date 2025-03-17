/**
 * Team utility functions
 */
import { redis } from '../redis';

type TeamNames = Record<string | number, string>;

/**
 * Get team names and short names from Redis
 */
export const getTeamNames = async (): Promise<TeamNames> => {
    const teams = await redis.getJson<TeamNames>('teams');
    return teams || {};
};
