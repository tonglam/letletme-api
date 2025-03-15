import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const entryHistoryInfo2223 = mysqlTable('entry_history_info_2223', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    entry: int('entry').notNull(),
    season: varchar('season', { length: 255 }),
    totalPoints: int('total_points'),
    overallRank: int('overall_rank'),
    updateTime: timestamp('update_time'),
});
