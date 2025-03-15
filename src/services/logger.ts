import { serviceLogger } from '../config/logger';

/**
 * Service logger utility for logging service operations
 */
export const logService = {
    /**
     * Log service method entry with parameters
     */
    entry: (
        serviceName: string,
        methodName: string,
        params?: Record<string, unknown>,
    ): void => {
        serviceLogger.debug(
            { serviceName, methodName, params },
            `Service Entry: ${serviceName}.${methodName}()`,
        );
    },

    /**
     * Log service method success with result
     */
    success: (
        serviceName: string,
        methodName: string,
        result?: unknown,
        duration?: number,
    ): void => {
        const logData: Record<string, unknown> = { serviceName, methodName };

        if (result !== undefined) {
            logData.result = result;
        }

        if (duration !== undefined) {
            logData.durationMs = duration;
        }

        serviceLogger.info(
            logData,
            `Service Success: ${serviceName}.${methodName}() ${duration ? `(${duration}ms)` : ''}`,
        );
    },

    /**
     * Log service method error
     */
    error: (
        serviceName: string,
        methodName: string,
        error: unknown,
        duration?: number,
    ): void => {
        const errorObj =
            error instanceof Error
                ? {
                      name: error.name,
                      message: error.message,
                      stack: error.stack,
                  }
                : String(error);

        serviceLogger.error(
            {
                serviceName,
                methodName,
                error: errorObj,
                ...(duration !== undefined ? { durationMs: duration } : {}),
            },
            `Service Error: ${serviceName}.${methodName}() - ${error instanceof Error ? error.message : String(error)}`,
        );
    },

    /**
     * Log database operation
     */
    db: (
        operation: string,
        query: string,
        params?: unknown[],
        duration?: number,
    ): void => {
        serviceLogger.debug(
            {
                type: 'database',
                operation,
                query,
                params,
                ...(duration !== undefined ? { durationMs: duration } : {}),
            },
            `DB: ${operation} ${duration ? `(${duration}ms)` : ''}`,
        );
    },

    /**
     * Log Redis operation
     */
    redis: (operation: string, key: string, duration?: number): void => {
        serviceLogger.debug(
            {
                type: 'redis',
                operation,
                key,
                ...(duration !== undefined ? { durationMs: duration } : {}),
            },
            `Redis: ${operation} ${key} ${duration ? `(${duration}ms)` : ''}`,
        );
    },
};
