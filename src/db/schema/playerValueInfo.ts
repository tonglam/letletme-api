import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const playerValueInfo = mysqlTable('player_value_info', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    hourIndex: varchar('hour_index', { length: 255 }).notNull(),
    date: varchar('date', { length: 255 }).notNull(),
    event: int('event').notNull(),
    element: int('element').notNull(),
    code: int('code'),
    elementType: int('element_type'),
    webName: varchar('web_name', { length: 255 }),
    teamId: int('team_id'),
    teamShortName: varchar('team_short_name', { length: 255 }),
    chanceOfPlayingNextRound: int('chance_of_playing_next_round'),
    chanceOfPlayingThisRound: int('chance_of_playing_this_round'),
    transfersIn: int('transfers_in'),
    transfersInEvent: int('transfers_in_event'),
    transfersOut: int('transfers_out'),
    transfersOutEvent: int('transfers_out_event'),
    selectedByPercent: varchar('selected_by_percent', { length: 255 }),
    nowCost: int('now_cost'),
    updateTime: timestamp('update_time'),
});
