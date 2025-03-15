import { mysqlTable, serial, int, varchar } from 'drizzle-orm/mysql-core';

export const team1819 = mysqlTable('team_1819', {
    id: serial('id').primaryKey().notNull(),
    code: int('code'),
    name: varchar('name', { length: 255 }),
    shortName: varchar('short_name', { length: 255 }),
});
