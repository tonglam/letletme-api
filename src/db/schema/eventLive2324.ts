import { mysqlTable, serial, int, varchar } from 'drizzle-orm/mysql-core';

export const eventLive2324 = mysqlTable('event_live_2324', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    element: int('element').notNull(),
    elementType: int('element_type'),
    teamId: int('team_id'),
    event: int('event').notNull(),
    fixture: varchar('fixture', { length: 255 }),
    minutes: int('minutes'),
    goalsScored: int('goals_scored'),
    assists: int('assists'),
    cleanSheets: int('clean_sheets'),
    goalsConceded: int('goals_conceded'),
    ownGoals: int('own_goals'),
    penaltiesSaved: int('penalties_saved'),
    penaltiesMissed: int('penalties_missed'),
    yellowCards: int('yellow_cards'),
    redCards: int('red_cards'),
    saves: int('saves'),
    bonus: int('bonus'),
    bps: int('bps'),
    totalPoints: int('total_points').default(0),
});
