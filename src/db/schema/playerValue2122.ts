import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const playerValue2122 = mysqlTable('player_value_2122', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    element: int('element').notNull(),
    elementType: varchar('element_type', { length: 255 }).notNull(),
    event: int('event'),
    value: int('value').notNull(),
    changeDate: varchar('change_date', { length: 255 }),
    changeType: varchar('change_type', { length: 255 }),
    lastValue: int('last_value'),
    updateTime: timestamp('update_time'),
});
