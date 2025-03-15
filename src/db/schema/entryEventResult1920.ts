import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const entryEventResult1920 = mysqlTable('entry_event_result_1920', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    event: int('event').notNull(),
    entry: int('entry').notNull(),
    eventPoints: int('event_points'),
    eventTransfers: int('event_transfers'),
    eventTransfersCost: int('event_transfers_cost'),
    eventNetPoints: int('event_net_points'),
    eventBenchPoints: int('event_bench_points'),
    eventRank: int('event_rank'),
    eventChip: varchar('event_chip', { length: 255 }),
    eventPicks: varchar('event_picks', { length: 255 }),
    overallPoints: int('overall_points'),
    overallRank: int('overall_rank'),
    updateTime: timestamp('update_time'),
});
