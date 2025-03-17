# Fantasy Premier League API

A RESTful API for Fantasy Premier League data built with Elysia.js and Bun.

## Features

- Current event and deadline information
- Fixtures for the next gameweek
- Team information
- Player statistics
- League standings

## Redis Configuration

This application uses two separate Redis instances:

1. **Data Redis (Read-Only)**

    - Used for accessing application data
    - Configured with `REDIS_*` environment variables
    - This is a read-only replica and should not be written to

2. **Cache Redis (Read/Write)**
    - Used exclusively for caching
    - Configured with `CACHE_REDIS_*` environment variables
    - Requires write access

Make sure both Redis instances are properly configured in your environment.

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment
3. Install dependencies: `bun install`
4. Run the development server: `bun dev`

## API Documentation

API documentation is available at `/swagger` when the server is running.

## Testing

Run tests with: `bun test`

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - A fast JavaScript runtime, bundler, and package manager
- **Framework**: [Elysia.js](https://elysiajs.com/) - A high-performance TypeScript web framework
- **Database**: MySQL with [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
- **Testing**: Bun's built-in test runner with Jest-compatible API
- **Logging**: [Pino](https://getpino.io/) for structured logging with file rotation
- **Caching**: [Redis](https://redis.io/) for high-performance caching
- **Documentation**: Swagger via @elysiajs/swagger plugin

## Database Management

- Generate migrations: `bun run db:generate`
- Open Drizzle Studio: `bun run db:studio`

The database schema is defined using Drizzle ORM in the `src/db/schema` directory. Each table has its own file with type-safe column definitions. The schema is automatically validated against the database structure during tests.

### Database Configuration

Database connection settings are managed in `src/config/db.ts` and used by the Drizzle ORM instance in `src/db/index.ts`. The connection is configured to:

- Use connection pooling for better performance
- Automatically reconnect on connection loss
- Support proper cleanup on application shutdown

### Drizzle Studio

You can use Drizzle Studio to visually explore your database schema and data by running:

```bash
bun run db:studio
```

This will start a web interface where you can browse tables, run queries, and view relationships.

## API Endpoints

## Logging

The API uses Pino for structured logging. Logs are categorized into different files:

### Log Files

- `app.log`: Main application logs
- `http.log`: HTTP request/response logs
- `service.log`: Service layer operation logs
- `error.log`: Error logs from all sources

## License

This project is licensed under the MIT License.
