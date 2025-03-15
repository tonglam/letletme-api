import { mysqlTable, serial, int, timestamp } from 'drizzle-orm/mysql-core';

export const eventLiveSummary2122 = mysqlTable('event_live_summary_2122', {
    element: serial('element').primaryKey().notNull(),
    elementType: int('element_type'),
    teamId: int('team_id'),
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
    updateTime: timestamp('update_time'),
});
