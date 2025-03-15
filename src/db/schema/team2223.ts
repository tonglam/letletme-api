import { mysqlTable, serial, int, varchar } from 'drizzle-orm/mysql-core';

export const team2223 = mysqlTable('team_2223', {
    id: serial('id').primaryKey().notNull(),
    code: int('code'),
    name: varchar('name', { length: 255 }),
    shortName: varchar('short_name', { length: 255 }),
});
