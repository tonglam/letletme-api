import { mysqlTable, serial, int, timestamp } from 'drizzle-orm/mysql-core';

export const tournamentPointsGroupResult2324 = mysqlTable(
    'tournament_points_group_result_2324',
    {
        id: serial('id').primaryKey().autoincrement().notNull(),
        tournamentId: int('tournament_id').notNull(),
        groupId: int('group_id').notNull(),
        event: int('event').notNull(),
        entry: int('entry').notNull(),
        eventGroupRank: int('event_group_rank'),
        eventPoints: int('event_points'),
        eventCost: int('event_cost'),
        eventNetPoints: int('event_net_points'),
        eventRank: int('event_rank'),
        updateTime: timestamp('update_time'),
    },
);
