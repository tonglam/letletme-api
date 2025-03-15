import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const entryEventSimulatePick2021 = mysqlTable(
    'entry_event_simulate_pick_2021',
    {
        id: serial('id').primaryKey().autoincrement().notNull(),
        event: int('event').notNull(),
        entry: int('entry').notNull(),
        operator: int('operator'),
        lineup: varchar('lineup', { length: 255 }),
        createTime: timestamp('create_time'),
        updateTime: timestamp('update_time'),
    },
);
