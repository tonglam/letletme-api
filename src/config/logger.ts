import fs from 'fs';
import os from 'os';
import path from 'path';
import pino from 'pino';
import pinoRoll from 'pino-roll';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type RotationInterval = 'daily' | 'weekly' | 'monthly';

export interface LogConfig {
    level: LogLevel;
    rotationInterval: RotationInterval;
    maxFiles: number;
    maxSize: number;
    compress: boolean;
}

export const logPaths = {
    logsDir: path.join(process.cwd(), 'logs'),
    appLog: path.join(process.cwd(), 'logs', 'app.log'),
    errorLog: path.join(process.cwd(), 'logs', 'error.log'),
    httpLog: path.join(process.cwd(), 'logs', 'http.log'),
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
if (!fs.existsSync(logPaths.logsDir)) {
    fs.mkdirSync(logPaths.logsDir, { recursive: true, mode: 0o755 });
}

// Configure rotation options
function getRotationOptions(filename: string): {
    file: string;
    size: number;
    interval: string;
    compress: boolean;
    maxFiles: number;
    mkdir: boolean;
} {
    return {
        file: filename,
        size: config.maxSize,
        interval: config.rotationInterval,
        compress: config.compress,
        maxFiles: config.maxFiles,
        mkdir: true,
    };
}

// Create streams using pino-roll
// We use synchronous file streams initially and will replace them with pino-roll streams when ready
const appStream = fs.createWriteStream(logPaths.appLog, { flags: 'a' });
const errorStream = fs.createWriteStream(logPaths.errorLog, { flags: 'a' });
const httpStream = fs.createWriteStream(logPaths.httpLog, { flags: 'a' });

// Initialize pino-roll streams asynchronously
Promise.all([
    pinoRoll(getRotationOptions(logPaths.appLog)),
    pinoRoll(getRotationOptions(logPaths.errorLog)),
    pinoRoll(getRotationOptions(logPaths.httpLog)),
])
    .then(([appRollStream, errorRollStream, httpRollStream]) => {
        Object.assign(appStream, {
            write: appRollStream.write.bind(appRollStream),
        });
        Object.assign(errorStream, {
            write: errorRollStream.write.bind(errorRollStream),
        });
        Object.assign(httpStream, {
            write: httpRollStream.write.bind(httpRollStream),
        });
    })
    .catch((err) => {
        console.error('Failed to initialize pino-roll streams:', err);
    });

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

// Create HTTP logger
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
    },
    pino.multistream([
        { stream: httpStream },
        { level: 'error', stream: errorStream },
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
    // Close file streams
    if (appStream && typeof appStream.end === 'function') appStream.end();
    if (errorStream && typeof errorStream.end === 'function') errorStream.end();
    if (httpStream && typeof httpStream.end === 'function') httpStream.end();
});

export default baseLogger;
