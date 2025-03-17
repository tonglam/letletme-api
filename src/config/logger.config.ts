import fs from 'fs';
import os from 'os';
import path from 'path';
import pino from 'pino';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type RotationInterval = 'daily' | 'weekly' | 'monthly';

export interface LogConfig {
    level: LogLevel;
    rotationInterval: RotationInterval;
    maxFiles: number;
    maxSize: number;
    compress: boolean;
}

// Get the current date in YYYY-MM-DD format
function getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Define log paths with date in the filename
const dateStr = getDateString();
export const logPaths = {
    logsDir: path.join(process.cwd(), 'logs'),
    appLog: path.join(process.cwd(), 'logs', `app.${dateStr}.log`),
    errorLog: path.join(process.cwd(), 'logs', `error.${dateStr}.log`),
    httpLog: path.join(process.cwd(), 'logs', `http.${dateStr}.log`),
};

// Configuration object
export const config: LogConfig = {
    level: (process.env.LOG_LEVEL as LogLevel) || 'info',
    rotationInterval:
        (process.env.LOG_ROTATION_INTERVAL as RotationInterval) || 'daily',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '30', 10),
    maxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10), // 10MB default
    compress: process.env.LOG_COMPRESS !== 'false',
};

// Ensure logs directory exists
try {
    if (!fs.existsSync(logPaths.logsDir)) {
        fs.mkdirSync(logPaths.logsDir, { recursive: true, mode: 0o755 });
    }
} catch (error) {
    console.error('Failed to create logs directory:', error);
    process.exit(1);
}

// Create streams with error handling
function createLogStream(filePath: string): fs.WriteStream {
    try {
        // Ensure the file exists by creating it if it doesn't
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '', { mode: 0o644 });
        }

        const stream = fs.createWriteStream(filePath, {
            flags: 'a',
            mode: 0o644,
            autoClose: true,
        });

        stream.on('error', (error) => {
            console.error(`Error writing to ${filePath}:`, error);
        });

        stream.on('open', () => {
            console.log(`Log stream opened for ${filePath}`);
        });

        return stream;
    } catch (error) {
        console.error(`Failed to create write stream for ${filePath}:`, error);
        process.exit(1);
    }
}

// Create streams directly without rotation (we'll handle rotation by date in the filename)
const appStream = createLogStream(logPaths.appLog);
const errorStream = createLogStream(logPaths.errorLog);
const httpStream = createLogStream(logPaths.httpLog);

// Create base logger
const baseLogger = pino(
    {
        level: config.level,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
            level: (label) => ({ level: label }),
        },
        base: {
            pid: process.pid,
            host: os.hostname(),
            node_version: process.version,
        },
    },
    pino.multistream([
        { stream: appStream },
        { level: 'error', stream: errorStream },
    ]),
);

// Create HTTP logger with its own dedicated stream
const httpBaseLogger = pino(
    {
        level: config.level,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
            level: (label) => ({ level: label }),
        },
        base: {
            pid: process.pid,
            host: os.hostname(),
            node_version: process.version,
            module: 'http',
        },
        enabled: true,
    },
    pino.multistream([
        {
            stream: httpStream,
            level: 'debug', // Ensure all levels are written
        },
        {
            level: 'error',
            stream: errorStream,
        },
    ]),
);

// Export loggers
export const logger = baseLogger;
export const httpLogger = httpBaseLogger;
export const serviceLogger = baseLogger.child({ module: 'service' });

// Helper function to create module-specific loggers
export function createModuleLogger(moduleName: string): pino.Logger {
    return baseLogger.child({ module: moduleName });
}

// Handle process exit to close streams
process.on('exit', () => {
    try {
        // Close file streams
        if (appStream && typeof appStream.end === 'function') appStream.end();
        if (errorStream && typeof errorStream.end === 'function')
            errorStream.end();
        if (httpStream && typeof httpStream.end === 'function')
            httpStream.end();
    } catch (error) {
        console.error('Error closing log streams:', error);
    }
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
    try {
        baseLogger.fatal({ err: error }, 'Uncaught exception');
    } catch (e) {
        console.error('Failed to log uncaught exception:', e);
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    try {
        baseLogger.fatal({ err: reason }, 'Unhandled rejection');
    } catch (e) {
        console.error('Failed to log unhandled rejection:', e);
    }
    process.exit(1);
});

export default baseLogger;
