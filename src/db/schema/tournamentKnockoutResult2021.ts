import { mysqlTable, serial, int, timestamp } from 'drizzle-orm/mysql-core';

export const tournamentKnockoutResult2021 = mysqlTable(
    'tournament_knockout_result_2021',
    {
        id: serial('id').primaryKey().autoincrement().notNull(),
        tournamentId: int('tournament_id').notNull(),
        event: int('event').notNull(),
        matchId: int('match_id').notNull(),
        playAgainstId: int('play_against_id').notNull(),
        homeEntry: int('home_entry'),
        homeEntryNetPoints: int('home_entry_net_points'),
        homeEntryRank: int('home_entry_rank'),
        homeEntryGoalsScored: int('home_entry_goals_scored'),
        homeEntryGoalsConceded: int('home_entry_goals_conceded'),
        awayEntry: int('away_entry'),
        awayEntryNetPoints: int('away_entry_net_points'),
        awayEntryRank: int('away_entry_rank'),
        awayEntryGoalsScored: int('away_entry_goals_scored'),
        awayEntryGoalsConceded: int('away_entry_goals_conceded'),
        matchWinner: int('match_winner'),
        createTime: timestamp('create_time'),
        updateTime: timestamp('update_time'),
    },
);
