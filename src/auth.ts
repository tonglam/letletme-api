import { redis } from './redis';

// Define types for Better Auth
interface User {
    id: string;
    name?: string;
    email?: string;
    isAnonymous?: boolean; // Added for anonymous plugin
    [key: string]: unknown;
}

interface Session {
    id: string;
    userId: string;
    expires: number;
    [key: string]: unknown;
}

// Mock implementation of Better Auth with Anonymous plugin support
export const auth = {
    handler: (request: Request): Promise<Response> => {
        // Process the auth request
        const url = new URL(request.url);
        const path = url.pathname.split('/').pop();

        // Handle anonymous authentication if path is 'anonymous'
        if (path === 'anonymous') {
            return handleAnonymousAuth();
        }

        // Return a mock response
        return Promise.resolve(
            new Response(JSON.stringify({ status: 'success', path }), {
                headers: { 'Content-Type': 'application/json' },
            }),
        );
    },

    api: {
        getSession: async ({
            headers,
        }: {
            headers: Headers;
        }): Promise<{ user: User; session: Session } | null> => {
            // Check for session cookie
            const authHeader = headers.get('authorization');
            if (!authHeader) return null;

            // Extract token
            const token = authHeader.replace('Bearer ', '');
            if (!token) return null;

            // Get session from Redis
            const session = await redis.getJson<Session>(`session:${token}`);
            if (!session) return null;

            // Get user from Redis
            const user = await redis.getJson<User>(`user:${session.userId}`);
            if (!user) return null;

            return { user, session };
        },

        // Anonymous sign-in method
        signInAnonymous: async (): Promise<{
            user: User;
            session: Session;
        }> => {
            // Create anonymous user
            const user = await auth.createAnonymousUser();

            // Create session for anonymous user
            const session = await auth.createSession(user.id);

            return { user, session };
        },

        // Link anonymous account to a new authentication method
        linkAnonymousAccount: async (
            anonymousUserId: string,
            newUser: User,
        ): Promise<void> => {
            const anonymousUser = await redis.getJson<User>(
                `user:${anonymousUserId}`,
            );

            if (anonymousUser && anonymousUser.isAnonymous) {
                // Call onLinkAccount callback if provided
                await auth.onLinkAccount?.({ anonymousUser, newUser });

                // Delete anonymous user by default unless disabled
                if (!auth.disableDeleteAnonymousUser) {
                    await redis.del(`user:${anonymousUserId}`);
                }
            }
        },
    },

    // Anonymous plugin options
    emailDomainName: 'example.com',
    onLinkAccount: async ({
        anonymousUser,
        newUser,
    }: {
        anonymousUser: User;
        newUser: User;
    }): Promise<void> => {
        // Perform actions like moving data from anonymous user to the new user
        console.log(
            `Linking anonymous user ${anonymousUser.id} to new user ${newUser.id}`,
        );
    },
    disableDeleteAnonymousUser: false,

    // Create an anonymous user
    createAnonymousUser: async (): Promise<User> => {
        const id = crypto.randomUUID();
        const randomString = Math.random().toString(36).substring(2, 10);
        const email = `anon-${randomString}@${auth.emailDomainName}`;

        const user: User = {
            id,
            email,
            isAnonymous: true,
        };

        await redis.setJson(`user:${id}`, user);
        return user;
    },

    // Mock functions for the adapter
    createUser: async (userData: Partial<User>): Promise<User> => {
        const id = crypto.randomUUID();
        const user = { ...userData, id } as User;
        await redis.setJson(`user:${id}`, user);
        return user;
    },

    createSession: async (userId: string): Promise<Session> => {
        const id = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);
        const expires = now + 30 * 24 * 60 * 60; // 30 days

        const session: Session = {
            id,
            userId,
            expires,
        };

        await redis.setJson(`session:${id}`, session, expires - now);
        return session;
    },
};

// Helper function to handle anonymous authentication
async function handleAnonymousAuth(): Promise<Response> {
    try {
        const { user, session } = await auth.api.signInAnonymous();

        return new Response(
            JSON.stringify({
                status: 'success',
                user,
                session: {
                    id: session.id,
                    expires: session.expires,
                },
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            },
        );
    } catch (error: unknown) {
        console.error('Anonymous authentication error:', error);
        return new Response(
            JSON.stringify({
                status: 'error',
                message: 'Failed to create anonymous user',
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            },
        );
    }
}
