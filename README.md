# LetLetMe API

A simple REST API built with Elysia.js and Drizzle ORM.

## Features

- User management (CRUD operations)
- MySQL database integration with Drizzle ORM
- Swagger documentation
- JWT authentication

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
