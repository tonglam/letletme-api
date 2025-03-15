import {
    int,
    mysqlTable,
    serial,
    timestamp,
    varchar,
} from 'drizzle-orm/mysql-core';

export const entryEventPick = mysqlTable('entry_event_pick', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    event: int('event').notNull(),
    entry: int('entry').notNull(),
    transfers: int('transfers'),
    transfersCost: int('transfers_cost'),
    chip: varchar('chip', { length: 255 }),
    picks: varchar('picks', { length: 1000 }),
    updateTime: timestamp('update_time'),
});
