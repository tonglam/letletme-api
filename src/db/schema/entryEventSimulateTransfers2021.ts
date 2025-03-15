import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const entryEventSimulateTransfers2021 = mysqlTable(
    'entry_event_simulate_transfers_2021',
    {
        id: serial('id').primaryKey().autoincrement().notNull(),
        event: int('event').notNull(),
        entry: int('entry').notNull(),
        operator: int('operator'),
        teamValue: int('team_value'),
        bank: int('bank'),
        freeTransfers: int('free_transfers'),
        transfers: int('transfers'),
        transfersCost: int('transfers_cost'),
        transfersIn: varchar('transfers_in', { length: 255 }),
        transfersOut: varchar('transfers_out', { length: 255 }),
        lineup: varchar('lineup', { length: 255 }),
        createTime: timestamp('create_time'),
        updateTime: timestamp('update_time'),
    },
);
