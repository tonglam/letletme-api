import { mysqlTable, serial, int, timestamp } from 'drizzle-orm/mysql-core';

export const tournamentEntry2122 = mysqlTable('tournament_entry_2122', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    tournamentId: int('tournament_id').notNull(),
    leagueId: int('league_id'),
    entry: int('entry'),
    createTime: timestamp('create_time'),
});
