import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const entryHistoryInfo2324 = mysqlTable('entry_history_info_2324', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    entry: int('entry').notNull(),
    season: varchar('season', { length: 255 }),
    totalPoints: int('total_points'),
    overallRank: int('overall_rank'),
    updateTime: timestamp('update_time'),
});
