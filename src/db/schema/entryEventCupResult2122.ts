import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const entryEventCupResult2122 = mysqlTable(
    'entry_event_cup_result_2122',
    {
        id: serial('id').primaryKey().autoincrement().notNull(),
        event: int('event').notNull(),
        entry: int('entry').notNull(),
        entryName: varchar('entry_name', { length: 255 }),
        playerName: varchar('player_name', { length: 255 }),
        eventPoints: int('event_points'),
        againstEntry: int('against_entry'),
        againstEntryName: varchar('against_entry_name', { length: 255 }),
        againstPlayerName: varchar('against_player_name', { length: 255 }),
        againstEventPoints: int('against_event_points'),
        result: varchar('result', { length: 255 }),
        updateTime: timestamp('update_time'),
    },
);
