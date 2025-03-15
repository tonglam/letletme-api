import 'dotenv/config';

export const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'database',
    // Connection settings
    connectTimeout: 10000,
    connectionLimit: 10,
    waitForConnections: true,
    // Keepalive settings
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
};
