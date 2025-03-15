import { mysqlTable, serial, int, timestamp } from 'drizzle-orm/mysql-core';

export const tournamentKnockout2021 = mysqlTable('tournament_knockout_2021', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    tournamentId: int('tournament_id').notNull(),
    round: int('round'),
    startGw: int('start_gw'),
    endGw: int('end_gw'),
    matchId: int('match_id'),
    nextMatchId: int('next_match_id'),
    homeEntry: int('home_entry'),
    homeEntryNetPoints: int('home_entry_net_points'),
    homeEntryGoalsScored: int('home_entry_goals_scored'),
    homeEntryGoalsConceded: int('home_entry_goals_conceded'),
    awayEntry: int('away_entry'),
    awayEntryNetPoints: int('away_entry_net_points'),
    awayEntryGoalsScored: int('away_entry_goals_scored'),
    awayEntryGoalsConceded: int('away_entry_goals_conceded'),
    roundWinner: int('round_winner'),
    createTime: timestamp('create_time'),
    updateTime: timestamp('update_time'),
});
