import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const entryEventPick2021 = mysqlTable('entry_event_pick_2021', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    event: int('event').notNull(),
    entry: int('entry').notNull(),
    transfers: int('transfers'),
    transfersCost: int('transfers_cost'),
    chip: varchar('chip', { length: 255 }),
    picks: varchar('picks', { length: 255 }),
    updateTime: timestamp('update_time'),
});
