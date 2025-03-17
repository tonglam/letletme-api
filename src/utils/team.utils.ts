/**
 * Team utility functions
 */
import { logger } from '../config/logger.config';
import { dataRedis } from '../redis';
import { getCurrentSeason } from './event.utils';
import { teamKeys } from './redis-key.utils';

type TeamNames = Record<string | number, string>;

/**
 * Get team names and short names from Redis
 */
export const getTeamNames = async (): Promise<TeamNames> => {
    try {
        // Get current season
        const season = getCurrentSeason();

        // Get team names and short names using the correct key format
        const [names, shortNames] = await Promise.all([
            dataRedis.hgetall(teamKeys.teamNames(season)),
            dataRedis.hgetall(teamKeys.teamShortNames(season)),
        ]);

        if (!names || Object.keys(names).length === 0) {
            logger.warn(
                { key: teamKeys.teamNames(season) },
                'No team names found in Redis',
            );
            return {};
        }

        // Convert hash to TeamNames object
        const teamNames: TeamNames = {};
        for (const [id, name] of Object.entries(names)) {
            try {
                teamNames[id] = JSON.parse(name);
            } catch (parseErr) {
                logger.error(
                    { parseErr, id, name },
                    'Failed to parse team name JSON',
                );
                continue;
            }
        }

        // Add short names
        if (shortNames && Object.keys(shortNames).length > 0) {
            for (const [id, shortName] of Object.entries(shortNames)) {
                try {
                    teamNames[`${id}_short`] = JSON.parse(shortName);
                } catch (parseErr) {
                    logger.error(
                        { parseErr, id, shortName },
                        'Failed to parse team short name JSON',
                    );
                    continue;
                }
            }
        }

        return teamNames;
    } catch (err) {
        logger.error({ err }, 'Error getting team names from Redis');
        return {};
    }
};
