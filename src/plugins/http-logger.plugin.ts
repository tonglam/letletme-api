import { randomUUID } from 'crypto';
import { Elysia } from 'elysia';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { httpLogger } from '../config/logger.config';

function getStatusText(status: number): string {
    if (HttpStatusEnum[status]) {
        const enumName = HttpStatusEnum[status] as string;
        const parts = enumName.split('_');
        if (parts.length >= 3) {
            return parts.slice(2).join(' ');
        }
    }
    return 'Unknown';
}

function sanitizeHeaders(
    headers: Headers,
): Record<string, string | string[] | undefined> {
    const sanitized: Record<string, string | string[] | undefined> = {};
    const sensitiveHeaders = [
        'authorization',
        'cookie',
        'set-cookie',
        'x-api-key',
        'api-key',
        'password',
        'token',
    ];

    headers.forEach((value, key) => {
        if (sensitiveHeaders.includes(key.toLowerCase())) {
            sanitized[key] = '[REDACTED]';
        } else {
            sanitized[key] = value;
        }
    });

    return sanitized;
}

function extractApiVersion(pathname: string): string | undefined {
    const versionMatch =
        pathname.match(/\/v(\d+)(\/|$)/i) ||
        pathname.match(/\/api\/v(\d+)(\/|$)/i);
    return versionMatch ? `v${versionMatch[1]}` : undefined;
}

/**
 * HTTP Logger Plugin
 * Provides request/response logging functionality
 */
export const httpLoggerPlugin = new Elysia()
    .onBeforeHandle(({ request, store }) => {
        const requestId = randomUUID();
        const startTime = process.hrtime.bigint();

        (store as { requestId: string }).requestId = requestId;
        (store as { startTime: bigint }).startTime = startTime;

        const url = new URL(request.url);
        const query: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
            query[key] = value;
        });

        httpLogger.info({
            req: {
                id: requestId,
                method: request.method,
                url: request.url,
                path: url.pathname,
                query,
                headers: sanitizeHeaders(request.headers),
                userAgent: request.headers.get('user-agent') ?? undefined,
                ip:
                    request.headers.get('x-forwarded-for') ??
                    request.headers.get('x-real-ip') ??
                    undefined,
                referer: request.headers.get('referer') ?? undefined,
                contentType: request.headers.get('content-type') ?? undefined,
                contentLength: request.headers.has('content-length')
                    ? parseInt(request.headers.get('content-length') || '0', 10)
                    : undefined,
                apiVersion: extractApiVersion(url.pathname),
            },
            msg: `${request.method} ${url.pathname} - Request received`,
        });
    })
    .onAfterHandle(({ request, set, store }) => {
        const url = new URL(request.url);
        const typedStore = store as {
            startTime?: bigint;
            requestId?: string;
        };
        const duration =
            Number(process.hrtime.bigint() - (typedStore.startTime ?? 0n)) /
            1e6;

        const status = typeof set.status === 'number' ? set.status : 200;
        const statusText = getStatusText(status);
        const requestId = typedStore.requestId ?? randomUUID();

        const logLevel = status >= 400 ? 'warn' : 'info';
        httpLogger[logLevel]({
            res: {
                statusCode: status,
                statusText,
                headers: sanitizeHeaders(
                    new Headers(
                        Object.entries(set.headers).map(
                            ([key, value]) =>
                                [
                                    key,
                                    Array.isArray(value)
                                        ? value.join(', ')
                                        : String(value),
                                ] as [string, string],
                        ),
                    ),
                ),
                size: set.headers['content-length']
                    ? parseInt(String(set.headers['content-length']), 10)
                    : undefined,
                cacheHit: set.headers['x-cache'] === 'HIT',
            },
            req: {
                id: requestId,
                method: request.method,
                path: url.pathname,
            },
            responseTime: duration,
            msg: `${request.method} ${url.pathname} ${status} ${statusText} - ${duration.toFixed(2)}ms`,
        });
    })
    .onError(({ error, request, set, store }) => {
        const url = new URL(request.url);
        const typedStore = store as {
            startTime?: bigint;
            requestId?: string;
        };
        const duration =
            Number(process.hrtime.bigint() - (typedStore.startTime ?? 0n)) /
            1e6;

        const status = typeof set.status === 'number' ? set.status : 500;
        const statusText = getStatusText(status);
        const requestId = typedStore.requestId ?? randomUUID();

        httpLogger.error({
            err:
                error instanceof Error
                    ? {
                          type: error.name,
                          message: error.message,
                          stack: error.stack,
                          code: (error as { code?: string | number }).code,
                      }
                    : {
                          type: 'UnknownError',
                          message: String(error),
                      },
            req: {
                id: requestId,
                method: request.method,
                url: request.url,
                path: url.pathname,
            },
            res: {
                statusCode: status,
                statusText,
            },
            responseTime: duration,
            msg: `${request.method} ${url.pathname} ${status} ${statusText} - ${error instanceof Error ? error.message : String(error)}`,
        });
    });

// Extend Elysia store to include request tracking
declare module 'elysia' {
    interface ElysiaStore {
        startTime?: bigint;
        requestId?: string;
    }
}
