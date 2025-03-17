/**
 * Team utility functions
 */
import { redis } from '../redis';

/**
 * Get team names and short names from Redis
 */
export const getTeamNames = async (): Promise<
    Record<string | number, string>
> => {
    try {
        // Get team names from Redis
        const teamNames =
            await redis.getJson<Record<string, string>>('team-names');
        const teamShortNames =
            await redis.getJson<Record<string, string>>('team-short-names');

        if (!teamNames || !teamShortNames) {
            throw new Error('Team data not found');
        }

        // Combine names and short names
        const combinedNames: Record<string | number, string> = {};

        // Add full names
        Object.entries(teamNames).forEach(([id, name]) => {
            combinedNames[parseInt(id)] = name;
        });

        // Add short names with _short suffix
        Object.entries(teamShortNames).forEach(([id, shortName]) => {
            combinedNames[`${id}_short`] = shortName;
        });

        return combinedNames;
    } catch (error) {
        console.error('Error getting team names:', error);
        throw error;
    }
};
