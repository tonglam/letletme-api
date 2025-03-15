import {
    mysqlTable,
    serial,
    int,
    varchar,
    timestamp,
    date,
} from 'drizzle-orm/mysql-core';

export const subtitle = mysqlTable('subtitle', {
    id: serial('id').primaryKey().autoincrement().notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    jobType: varchar('job_type', { length: 255 }).notNull(),
    videoType: varchar('video_type', { length: 255 }).notNull(),
    length: int('length'),
    translatorLength: int('translator_length'),
    proofreaderLength: int('proofreader_length'),
    automaticCaptions: int('automatic_captions'),
    translator: varchar('translator', { length: 255 }),
    jobDate: date('job_date'),
    proofreader: varchar('proofreader', { length: 255 }),
    proportion: varchar('proportion', { length: 255 }),
    status: varchar('status', { length: 255 }),
    finishDate: date('finish_date'),
    createTime: timestamp('create_time'),
    updateTime: timestamp('update_time'),
});
