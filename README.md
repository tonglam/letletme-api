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

4. Set up the database:

```bash
bun run db:setup
```

### Running the API

```bash
bun run dev
```

The API will be available at http://localhost:3000 and the Swagger documentation at http://localhost:3000/swagger.

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

## License

This project is licensed under the MIT License.
