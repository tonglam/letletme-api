import { mysqlTable, serial, int, varchar } from 'drizzle-orm/mysql-core';

export const player1718 = mysqlTable('player_1718', {
    element: serial('element').primaryKey().notNull(),
    code: int('code'),
    price: int('price'),
    startPrice: int('start_price'),
    elementType: varchar('element_type', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 255 }),
    secondName: varchar('second_name', { length: 255 }),
    webName: varchar('web_name', { length: 255 }),
    teamId: int('team_id'),
});
