import fs from 'fs';
import path from 'path';
import { logPaths } from '../../src/config/logger.js';

interface LogEntry {
    msg: string;
    level: string;
    time: string;
    pid: number;
    host: string;
    node_version: string;
    module?: string;
    err?: {
        message: string;
        type: string;
        stack: string;
    };
    [key: string]: unknown;
}

export const logTestUtils = {
    ensureLogsDir(): void {
        if (!fs.existsSync(logPaths.logsDir)) {
            fs.mkdirSync(logPaths.logsDir, { recursive: true, mode: 0o777 });
        } else {
            fs.chmodSync(logPaths.logsDir, 0o777);
        }
    },

    ensureLogFiles(): void {
        [logPaths.appLog, logPaths.errorLog, logPaths.httpLog].forEach(
            (logPath) => {
                try {
                    if (!fs.existsSync(path.dirname(logPath))) {
                        fs.mkdirSync(path.dirname(logPath), {
                            recursive: true,
                        });
                    }
                    fs.writeFileSync(logPath, '', { mode: 0o644 });
                } catch (error) {
                    console.error(
                        `Failed to create/truncate log file: ${logPath}`,
                        error,
                    );
                }
            },
        );
    },

    cleanLogs(files: string[]): void {
        files.forEach((file) => {
            const filePath = path.join(logPaths.logsDir, file);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error(`Failed to clean log file: ${filePath}`, err);
                }
            }
        });
    },

    waitForLogs(timeout = 1000): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    // Ensure all log files are flushed
                    fs.readdirSync(logPaths.logsDir)
                        .filter((file) => file.endsWith('.log'))
                        .forEach((file) => {
                            const filePath = path.join(logPaths.logsDir, file);
                            try {
                                const content = fs.readFileSync(
                                    filePath,
                                    'utf-8',
                                );
                                fs.writeFileSync(filePath, content, {
                                    mode: 0o666,
                                });
                            } catch (err) {
                                console.error(
                                    `Failed to sync log file: ${filePath}`,
                                    err,
                                );
                            }
                        });
                } catch (err) {
                    console.error('Error during log sync:', err);
                }
                resolve();
            }, timeout);
        });
    },

    readLogEntries(fileName: string): LogEntry[] {
        const filePath = path.join(logPaths.logsDir, fileName);
        if (!fs.existsSync(filePath)) {
            console.warn(`Log file does not exist: ${filePath}`);
            return [];
        }

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return content
                .trim()
                .split('\n')
                .filter(Boolean)
                .map((line) => JSON.parse(line));
        } catch (err) {
            console.error(`Failed to read log entries from ${filePath}:`, err);
            return [];
        }
    },

    getLogFileSize(file: string): number {
        const filePath = path.join(logPaths.logsDir, file);
        if (!fs.existsSync(filePath)) {
            return 0;
        }
        // Ensure file is flushed before getting size
        fs.fsyncSync(fs.openSync(filePath, 'r'));
        return fs.statSync(filePath).size;
    },

    getRotatedLogFiles(baseFile: string): string[] {
        return fs
            .readdirSync(logPaths.logsDir)
            .filter((file) => file.startsWith(baseFile + '.'))
            .sort();
    },
};
