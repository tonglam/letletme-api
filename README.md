# LetLetMe API

A simple REST API built with Elysia.js and Drizzle ORM.

## Features

- User management (CRUD operations)
- MySQL database integration with Drizzle ORM
- Swagger documentation
- JWT authentication
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
- Push schema changes: `bun run db:push`
- Open Drizzle Studio: `bun run db:studio`

## API Endpoints

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get a user by ID
- `POST /users` - Create a new user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

## Schema Validation

### Validating Schema Structure

To validate the schema structure without a database connection, run:

```bash
bun run src/scripts/validate-schema-structure.ts
```

This script will analyze all schema definitions and check for any structural issues.

### Validating Schema Against Database

To validate the schema against the actual database structure, run:

```bash
bun test tests/db.test.ts
```

This test will connect to the database and verify that all schema tables and columns match the database structure.

### Fixing Common Schema Issues

#### Varchar Columns Without Length

If you encounter errors related to varchar columns missing length parameters, run:

```bash
bun run src/scripts/fix-varchar-columns.ts
```

This script will automatically add a default length of 255 to all varchar columns that don't have a length specified.

#### Unused Imports

If you encounter linter errors related to unused imports in schema files, run:

```bash
bun run src/scripts/fix-unused-imports.ts
```

This script will analyze each schema file and remove any unused imports from the Drizzle ORM library.

#### Formatting Issues

To fix formatting issues in the schema files, run:

```bash
bun run lint --fix
```

This will automatically fix most formatting issues according to the project's ESLint and Prettier configuration.

### Schema Validation Results

The schema validation process has been completed successfully. All 27 schema tables have been verified against the database structure, and all columns match correctly. The following issues were fixed:

1. Added length parameters to all varchar columns (default: 255)
2. Removed unused imports from schema files
3. Fixed formatting issues in schema files

### Manual Validation Steps

If automatic validation fails, you can manually check:

1. Table existence in both schema and database
2. Column count matches between schema and database
3. Column types match between schema and database
4. Column nullability matches between schema and database

## License

This project is licensed under the MIT License.

## Logging

The API uses Pino for structured logging. Logs are categorized into different files:

### Log Files

- `app.log`: Main application logs
- `http.log`: HTTP request/response logs
- `service.log`: Service layer operation logs
- `error.log`: Error logs from all sources

### Log File Management

Log files are automatically rotated based on the following rules:

- Size-based rotation: Files are rotated when they reach 10MB
- Time-based rotation: Files are rotated daily
- Retention: Last 5 rotated files are kept for each log type

### Log Levels

The following log levels are available (from most to least verbose):

- `trace`: Very detailed debugging information
- `debug`: Debugging information
- `info`: General information (default)
- `warn`: Warnings
- `error`: Errors
- `fatal`: Critical errors that cause the application to crash

You can configure the log level using the `LOG_LEVEL` environment variable.

### Setting Up Logging

1. Initialize the logs directory:

```bash
bun run logs:init
```

2. Configure log level in your `.env` file:

```env
LOG_LEVEL=info  # or debug, error, etc.
```

### Development vs Production

In development mode:

- Logs are formatted for readability using `pino-pretty`
- All logs are output to both console and files

In production mode:

- Logs are output as JSON for better integration with log management systems
- Main application logs go to `app.log`
- Errors from all sources are collected in `error.log`
- HTTP and service logs are separated into their respective files

### Log Directory Structure

```
logs/
├── .gitignore        # Automatically created to ignore log files
├── app.log           # Main application logs
├── app.log.1         # Rotated app logs
├── error.log         # Error logs from all sources
├── error.log.1       # Rotated error logs
├── http.log          # HTTP request/response logs
├── http.log.1        # Rotated HTTP logs
├── service.log       # Service operation logs
└── service.log.1     # Rotated service logs
```

Note: Log files are automatically rotated and old files are named with incrementing numbers (e.g., `.1`, `.2`, etc.).
