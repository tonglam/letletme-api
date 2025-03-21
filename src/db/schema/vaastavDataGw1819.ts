import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const vaastavDataGw1819 = mysqlTable('vaastav_data_gw_1819', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    name: varchar('name', { length: 255 }),
    position: varchar('position', { length: 255 }),
    team: varchar('team', { length: 255 }),
    xP: varchar('xP', { length: 255 }),
    assist: int('assist'),
    bonus: int('bonus'),
    bps: int('bps'),
    cleanSheets: int('clean_sheets'),
    creativity: varchar('creativity', { length: 255 }),
    element: int('element'),
    fixture: int('fixture'),
    goalsConceded: int('goals_conceded'),
    goalsScored: int('goals_scored'),
    ictIndex: varchar('ict_index', { length: 255 }),
    influence: varchar('influence', { length: 255 }),
    kickoffTime: timestamp('kickoff_time'),
    minutes: int('minutes'),
    opponentTeam: int('opponent_team'),
    ownGoals: int('own_goals'),
    penaltiesMissed: int('penalties_missed'),
    penaltiesSaved: int('penalties_saved'),
    redCards: int('red_cards'),
    round: int('round'),
    saves: int('saves'),
    selected: int('selected'),
    teamAScore: int('team_a_score'),
    teamHScore: int('team_h_score'),
    threat: varchar('threat', { length: 255 }),
    totalPoints: int('total_points'),
    transfersBalance: int('transfers_balance'),
    transfersIn: int('transfers_in'),
    transfersOut: int('transfers_out'),
    value: int('value'),
    wasHome: varchar('was_home', { length: 255 }),
    yellowCards: int('yellow_cards'),
    gw: int('gw'),
});
