import { Elysia } from 'elysia';
import fs from 'fs';
import path from 'path';
import { httpLogger } from '../config/logger.config';

// Get the log file path for the current date
function getLogPath(): string {
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const logsDir = path.join(process.cwd(), 'logs');
    const logPath = path.join(logsDir, `http.${dateStr}.log`);
    const debugPath = path.join(logsDir, 'http-debug.log');

    // Ensure logs directory exists
    try {
        if (!fs.existsSync(logsDir)) {
            fs.appendFileSync(
                debugPath,
                `Creating logs directory: ${logsDir}\n`,
            );
            httpLogger.debug(`Creating logs directory: ${logsDir}`);
            fs.mkdirSync(logsDir, { recursive: true });
        }
    } catch (error) {
        fs.appendFileSync(
            debugPath,
            `Failed to create logs directory: ${error}\n`,
        );
        httpLogger.error({ err: error }, 'Failed to create logs directory');
        throw error;
    }

    return logPath;
}

// Write a message to the log file
function writeLog(message: string): void {
    try {
        const logPath = getLogPath();
        const formattedMessage = `${message}\n`;

        // Write to both stdout and file
        process.stdout.write(formattedMessage);
        fs.appendFileSync(logPath, formattedMessage);
    } catch (error) {
        // If file write fails, at least write to stderr
        process.stderr.write(`Failed to write to log file: ${error}\n`);
        process.stderr.write(`Original message: ${message}\n`);
    }
}

/**
 * HTTP Logger Plugin
 * Provides request/response logging functionality
 */
export const httpLoggerPlugin = new Elysia({ name: 'http-logger' })
    .derive(() => {
        writeLog(`[${new Date().toISOString()}] HTTP Logger plugin registered`);
        return {};
    })
    .onBeforeHandle(({ request }) => {
        try {
            const url = new URL(request.url);
            writeLog(
                `[${new Date().toISOString()}] ${request.method} ${url.pathname} - Request received`,
            );
        } catch (error) {
            process.stderr.write(`Error in onBeforeHandle: ${error}\n`);
        }
    })
    .onAfterHandle(({ request, set }) => {
        try {
            const url = new URL(request.url);
            const status = typeof set.status === 'number' ? set.status : 200;
            writeLog(
                `[${new Date().toISOString()}] ${request.method} ${url.pathname} ${status} - Response sent`,
            );
        } catch (error) {
            process.stderr.write(`Error in onAfterHandle: ${error}\n`);
        }
    })
    .onError(({ request, set, error }) => {
        try {
            const url = new URL(request.url);
            const status = typeof set.status === 'number' ? set.status : 500;
            writeLog(
                `[${new Date().toISOString()}] ${request.method} ${url.pathname} ${status} - Error: ${error instanceof Error ? error.message : String(error)}`,
            );
        } catch (error) {
            process.stderr.write(`Error in onError: ${error}\n`);
        }
    });

// Extend Elysia store to include request tracking
declare module 'elysia' {
    interface ElysiaStore {
        startTime?: bigint;
        requestId?: string;
    }
}
