import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const standing = mysqlTable('standing', {
    position: serial('position').primaryKey().notNull(),
    event: int('event').notNull(),
    teamId: int('team_id').notNull(),
    teamName: varchar('team_name', { length: 255 }),
    teamShortName: varchar('team_short_name', { length: 255 }),
    points: int('points').notNull(),
    played: int('played'),
    won: int('won'),
    drawn: int('drawn'),
    lost: int('lost'),
    goalsFor: int('goals_for'),
    goalsAgainst: int('goals_against'),
    goalsDifference: int('goals_difference'),
    createTime: timestamp('create_time'),
});
