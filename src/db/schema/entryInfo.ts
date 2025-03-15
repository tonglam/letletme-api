import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
} from 'drizzle-orm/mysql-core';

export const entryInfo = mysqlTable('entry_info', {
    entry: serial('entry').primaryKey().notNull(),
    entryName: varchar('entry_name', { length: 255 }),
    playerName: varchar('player_name', { length: 255 }),
    region: varchar('region', { length: 255 }),
    startedEvent: int('started_event'),
    overallPoints: int('overall_points'),
    overallRank: int('overall_rank'),
    bank: int('bank'),
    teamValue: int('team_value'),
    totalTransfers: int('total_transfers'),
    lastEntryName: varchar('last_entry_name', { length: 255 }),
    lastOverallPoints: int('last_overall_points'),
    lastOverallRank: int('last_overall_rank'),
    lastTeamValue: int('last_team_value'),
    usedEntryName: varchar('used_entry_name', { length: 255 }),
    createTime: timestamp('create_time'),
    updateTime: timestamp('update_time'),
});
