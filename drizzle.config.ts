import { defineConfig } from 'drizzle-kit';
import { dbConfig } from './src/config/db';

// Use imported configuration
export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema/index.ts',
    dialect: 'mysql',
    dbCredentials: {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
    },
});
