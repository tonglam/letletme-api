import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const playerStat1819 = mysqlTable('player_stat_1819', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    event: int('event').notNull(),
    element: int('element').notNull(),
    code: int('code'),
    matchPlayed: int('match_played'),
    chanceOfPlayingNextRound: int('chance_of_playing_next_round'),
    chanceOfPlayingThisRound: int('chance_of_playing_this_round'),
    dreamteamCount: int('dreamteam_count'),
    eventPoints: int('event_points'),
    form: varchar('form', { length: 255 }),
    inDreamteam: int('in_dreamteam').default(0),
    news: varchar('news', { length: 255 }),
    newsAdded: varchar('news_added', { length: 255 }),
    pointsPerGame: varchar('points_per_game', { length: 255 }),
    selectedByPercent: varchar('selected_by_percent', { length: 255 }),
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
    influence: varchar('influence', { length: 255 }),
    creativity: varchar('creativity', { length: 255 }),
    threat: varchar('threat', { length: 255 }),
    ictIndex: varchar('ict_index', { length: 255 }),
    transfersInEvent: int('transfers_in_event'),
    transfersOutEvent: int('transfers_out_event'),
    transfersIn: int('transfers_in'),
    transfersOut: int('transfers_out'),
    cornersAndIndirectFreekicksOrder: int(
        'corners_and_indirect_freekicks_order',
    ),
    directFreekicksOrder: int('direct_freekicks_order'),
    penaltiesOrder: int('penalties_order'),
    updateTime: timestamp('update_time'),
});
