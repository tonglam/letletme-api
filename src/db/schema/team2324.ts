import { mysqlTable, serial, int, varchar } from 'drizzle-orm/mysql-core';

export const team2324 = mysqlTable('team_2324', {
    id: serial('id').primaryKey().notNull(),
    code: int('code'),
    name: varchar('name', { length: 255 }),
    shortName: varchar('short_name', { length: 255 }),
});
