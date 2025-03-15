import { mysqlTable, serial, int, varchar } from 'drizzle-orm/mysql-core';

export const team1920 = mysqlTable('team_1920', {
    id: serial('id').primaryKey().notNull(),
    code: int('code'),
    name: varchar('name', { length: 255 }),
    shortName: varchar('short_name', { length: 255 }),
});
