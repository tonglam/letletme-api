import { mysqlTable, serial, int, varchar } from 'drizzle-orm/mysql-core';

export const entryEventTransfers2122 = mysqlTable(
    'entry_event_transfers_2122',
    {
        id: serial('id').primaryKey().autoincrement().notNull(),
        event: int('event').notNull(),
        entry: int('entry').notNull(),
        elementIn: int('element_in'),
        elementInCost: int('element_in_cost'),
        elementInPlayed: int('element_in_played'),
        elementInPoints: int('element_in_points').default(0),
        elementOut: int('element_out'),
        elementOutCost: int('element_out_cost'),
        elementOutPoints: int('element_out_points').default(0),
        time: varchar('time', { length: 255 }),
    },
);
