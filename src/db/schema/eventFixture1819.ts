import { mysqlTable, serial, int, timestamp } from 'drizzle-orm/mysql-core';

export const eventFixture1819 = mysqlTable('event_fixture_1819', {
    id: serial('id').primaryKey().notNull(),
    code: int('code').notNull(),
    event: int('event').notNull(),
    kickoffTime: timestamp('kickoff_time'),
    started: int('started'),
    finished: int('finished'),
    provisionalStartTime: int('provisional_start_time'),
    finishedProvisional: int('finished_provisional'),
    minutes: int('minutes'),
    teamH: int('team_h'),
    teamHDifficulty: int('team_h_difficulty'),
    teamHScore: int('team_h_score'),
    teamA: int('team_a'),
    teamADifficulty: int('team_a_difficulty'),
    teamAScore: int('team_a_score'),
    updateTime: timestamp('update_time'),
});
