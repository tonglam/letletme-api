import type { Context } from 'elysia';
import { auth } from '../auth';

// Define types for user and session
interface User {
    id: string;
    name?: string;
    email?: string;
    isAnonymous?: boolean;
    [key: string]: unknown;
}

interface Session {
    id: string;
    userId: string;
    expires: number;
    [key: string]: unknown;
}

// Better Auth view handler for Elysia
export const betterAuthView = async (context: Context): Promise<Response> => {
    const BETTER_AUTH_ACCEPT_METHODS = ['POST', 'GET'];

    // Validate request method
    if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
        return auth.handler(context.request);
    } else {
        context.set.status = 405;
        return new Response('Method Not Allowed', { status: 405 });
    }
};

// User middleware to provide session and user information
export const userMiddleware = async (
    request: Request,
): Promise<{
    user: User | null;
    session: Session | null;
    isAnonymous: boolean;
}> => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        return {
            user: null,
            session: null,
            isAnonymous: false,
        };
    }

    return {
        user: session.user,
        session: session.session,
        isAnonymous: !!session.user.isAnonymous,
    };
};

// Helper to check if a user is anonymous
export const isAnonymousUser = (user: User | null): boolean => {
    return !!user?.isAnonymous;
};

// Helper to link an anonymous account to a regular account
export const linkAnonymousAccount = async (
    anonymousUserId: string,
    newUser: User,
): Promise<void> => {
    return auth.api.linkAnonymousAccount(anonymousUserId, newUser);
};
