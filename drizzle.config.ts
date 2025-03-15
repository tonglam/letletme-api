import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DB_HOST) throw new Error('DB_HOST is required');
if (!process.env.DB_NAME) throw new Error('DB_NAME is required');

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER ?? undefined,
        password: process.env.DB_PASSWORD ?? undefined,
        database: process.env.DB_NAME,
    },
});
