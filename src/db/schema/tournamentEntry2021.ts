import { mysqlTable, serial, int, timestamp } from 'drizzle-orm/mysql-core';

export const tournamentEntry2021 = mysqlTable('tournament_entry_2021', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    tournamentId: int('tournament_id').notNull(),
    leagueId: int('league_id'),
    entry: int('entry'),
    createTime: timestamp('create_time'),
});
