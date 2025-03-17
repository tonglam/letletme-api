import { Elysia } from 'elysia';

type ErrorResponse = {
    code: string;
    message: string;
    errors?: unknown;
};

/**
 * Global error handler plugin
 * Provides consistent error handling across all routes
 */
export const errorHandler = new Elysia().onError(({ code, error, set }) => {
    const response: ErrorResponse = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
    };

    let status = 500;

    switch (code) {
        case 'VALIDATION':
            response.code = 'VALIDATION_ERROR';
            response.message =
                error instanceof Error ? error.message : 'Validation error';
            if ('all' in error) {
                response.errors = error.all;
            }
            status = 400;
            break;
        case 'NOT_FOUND':
            response.code = 'NOT_FOUND';
            response.message = 'Resource not found';
            status = 404;
            break;
        case 'PARSE':
            response.code = 'PARSE_ERROR';
            response.message = 'Invalid request format';
            status = 400;
            break;
        default:
            if (error instanceof Error) {
                response.code = 'INTERNAL_SERVER_ERROR';
                response.message = error.message;
            }
            console.error('Unhandled error:', error);
            status = 500;
    }

    set.status = status;
    return { error: response };
});
