import { mysqlTable, serial, int, timestamp } from 'drizzle-orm/mysql-core';

export const tournamentEntry = mysqlTable('tournament_entry', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    tournamentId: int('tournament_id').notNull(),
    leagueId: int('league_id'),
    entry: int('entry'),
    createTime: timestamp('create_time'),
});
