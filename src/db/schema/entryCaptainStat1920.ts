import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const entryCaptainStat1920 = mysqlTable('entry_captain_stat_1920', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    entry: int('entry').notNull(),
    event: int('event').notNull(),
    entryName: varchar('entry_name', { length: 255 }),
    playerName: varchar('player_name', { length: 255 }),
    overallPoints: int('overall_points'),
    overallRank: int('overall_rank'),
    chip: varchar('chip', { length: 255 }),
    element: int('element'),
    webName: varchar('web_name', { length: 255 }),
    points: int('points'),
    totalPoints: int('total_points'),
    updateTime: timestamp('update_time'),
});
