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
export const errorHandler = new Elysia().onError(({ code, error }) => {
    const response: ErrorResponse = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
    };

    switch (code) {
        case 'VALIDATION':
            response.code = 'VALIDATION_ERROR';
            response.message =
                error instanceof Error ? error.message : 'Validation error';
            if ('all' in error) {
                response.errors = error.all;
            }
            break;
        case 'NOT_FOUND':
            response.code = 'NOT_FOUND';
            response.message = 'Resource not found';
            break;
        case 'PARSE':
            response.code = 'PARSE_ERROR';
            response.message = 'Invalid request format';
            break;
        default:
            console.error('Unhandled error:', error);
    }

    return response;
});
