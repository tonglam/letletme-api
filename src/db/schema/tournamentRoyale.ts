import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const tournamentRoyale = mysqlTable('tournament_royale', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    tournamentId: int('tournament_id').notNull(),
    event: int('event').notNull(),
    eventEliminatedNum: int('event_eliminated_num'),
    nextEventEliminatedNum: int('next_event_eliminated_num'),
    eventEliminatedEntries: varchar('event_eliminated_entries', {
        length: 255,
    }),
    waitingEliminatedEntries: varchar('waiting_eliminated_entries', {
        length: 255,
    }),
    allEliminatedEntries: varchar('all_eliminated_entries', { length: 255 }),
    createTime: timestamp('create_time'),
    updateTime: timestamp('update_time'),
});
