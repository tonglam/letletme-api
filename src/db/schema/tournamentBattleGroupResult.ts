import { mysqlTable, serial, int, timestamp } from 'drizzle-orm/mysql-core';

export const tournamentBattleGroupResult = mysqlTable(
    'tournament_battle_group_result',
    {
        id: serial('id').primaryKey().autoincrement().notNull(),
        tournamentId: int('tournament_id').notNull(),
        groupId: int('group_id').notNull(),
        event: int('event').notNull(),
        homeIndex: int('home_index'),
        homeEntry: int('home_entry'),
        homeEntryNetPoints: int('home_entry_net_points').default(0),
        homeEntryRank: int('home_entry_rank').default(0),
        homeEntryMatchPoints: int('home_entry_match_points').default(0),
        awayIndex: int('away_index'),
        awayEntry: int('away_entry'),
        awayEntryNetPoints: int('away_entry_net_points').default(0),
        awayEntryRank: int('away_entry_rank').default(0),
        awayEntryMatchPoints: int('away_entry_match_points'),
        updateTime: timestamp('update_time'),
    },
);
