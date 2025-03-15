import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const entryLeagueInfo2122 = mysqlTable('entry_league_info_2122', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    entry: int('entry').notNull(),
    leagueId: int('league_id').notNull(),
    type: varchar('type', { length: 255 }).notNull(),
    leagueType: varchar('league_type', { length: 255 }).notNull(),
    leagueName: varchar('league_name', { length: 255 }),
    entryRank: int('entry_rank'),
    entryLastRank: int('entry_last_rank'),
    startEvent: int('start_event'),
    created: varchar('created', { length: 255 }),
    updateTime: timestamp('update_time'),
});
