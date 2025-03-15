import { mysqlTable, serial, int, varchar } from 'drizzle-orm/mysql-core';

export const event1617 = mysqlTable('event_1617', {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    deadlineTime: varchar('deadline_time', { length: 255 }),
    averageEntryScore: int('average_entry_score'),
    finished: int('finished').notNull(),
    highestScore: int('highest_score'),
    highestScoringEntry: int('highest_scoring_entry'),
    isPrevious: int('is_previous'),
    isCurrent: int('is_current'),
    isNext: int('is_next'),
    mostSelected: int('most_selected'),
    mostTransferredIn: int('most_transferred_in'),
    mostCaptained: int('most_captained'),
    mostViceCaptained: int('most_vice_captained'),
});
