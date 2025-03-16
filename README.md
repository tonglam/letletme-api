# LetLetMe API

A simple REST API built with Elysia.js and Drizzle ORM.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - A fast JavaScript runtime, bundler, and package manager
- **Framework**: [Elysia.js](https://elysiajs.com/) - A high-performance TypeScript web framework
- **Database**: MySQL with [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
- **Testing**: Bun's built-in test runner with Jest-compatible API
- **Logging**: [Pino](https://getpino.io/) for structured logging with file rotation
- **Caching**: [Redis](https://redis.io/) for high-performance caching
- **Documentation**: Swagger via @elysiajs/swagger plugin

## Features

- User management (CRUD operations)
- MySQL database integration with Drizzle ORM
- Swagger documentation
- Structured logging with Pino

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- MySQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Configure environment variables:

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

1. Set up the database:

```bash
bun run db:setup
```

### Running the API

```bash
bun run dev
```

The API will be available at <http://localhost:3000> and the Swagger documentation at <http://localhost:3000/swagger>.

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
