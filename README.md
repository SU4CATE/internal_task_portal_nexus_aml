# Nexus AML Internal Task Portal

A small full-stack task portal built for the Nexus AML take-home assessment. Users can create an account, sign in, and manage their own task list from a protected workspace.

## Features

- Account registration and login with securely hashed passwords
- Database-backed sessions with secure, HTTP-only cookies
- Protected portal pages and authenticated API operations
- Per-user task isolation
- Create, edit, delete, and change the status of tasks
- Type-safe persistence with Prisma ORM and committed migrations
- Responsive, accessible interface built with a small Shadcn-style component layer
- Clear empty, loading, error, and destructive-action states

## Run locally

Requirements: Node.js 22 or later and npm.

```bash
npm install
cp .env.example .env
npm run db:deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The migration creates the local SQLite database at `data/portal.db`.

The `DATABASE_URL` environment variable is optional for local development. Prisma defaults to `file:./data/portal.db` when it is not set.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

When changing the data model, update `prisma/schema.prisma` and create a reviewed migration:

```bash
npm run db:migrate -- --name describe_the_change
```

## Technical approach

### Application structure

The project uses the Next.js App Router. Pages render on the server where possible, while the forms and task interactions are small client components. Route handlers under `app/api` form the backend boundary. Prisma repositories and authentication concerns live in `lib`, separate from both route handlers and presentation components.

The initial task list is server-rendered. Subsequent creates and updates use the API and update local UI state, which keeps interactions quick without introducing a client data-fetching library for this project size.

### Data storage

SQLite was selected because the brief permits any storage approach and the assessment should run with minimal setup. Prisma ORM provides the application-facing data layer: model definitions, generated types, relationship handling, and a clear migration history. Prisma 7's official SQLite adapter supplies the low-level connection, but application code does not access the database driver directly.

The data model contains:

- `users`: account identity and password hash
- `sessions`: hashed opaque session tokens and expiry
- `tasks`: task data with a foreign key to its owner

The initial schema is captured in `prisma/migrations` and applied with `prisma migrate deploy`; the application does not create or modify tables at runtime. For a production service deployed across multiple instances, Prisma keeps the repository code and migration workflow consistent while the datasource can move to PostgreSQL.

### Authentication and security

- Passwords are hashed with bcrypt using a work factor of 12.
- Session tokens are generated from 32 cryptographically random bytes. Only a SHA-256 hash is stored in the database.
- The session cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Protected pages validate the session on the server. The proxy provides an earlier redirect when no session cookie exists, but is not treated as the security boundary.
- Every task API operation independently validates the session.
- Task reads and writes always include the authenticated user's ID, preventing access to another user's task by changing an ID.
- Mutation endpoints reject cross-origin browser requests, providing an additional CSRF safeguard alongside the SameSite cookie.
- Request bodies are validated with Zod and all database access uses Prisma's typed query API.

### UI decisions

The interface intentionally stays close to familiar enterprise patterns: restrained colour, clear hierarchy, compact status controls, breadcrumbs, visible feedback, and a confirmation step before deletion. The reusable primitives in `components/ui` follow Shadcn conventions while keeping the dependency surface small.

Task statuses are deliberately limited to **To do**, **In progress**, and **Completed**. This is enough for Part 1 and leaves room for the evidence-review states described in Part 2 without prematurely modelling that workflow.

## Main trade-offs

- Sessions expire after seven days but are not renewed on activity. Sliding expiry and a scheduled expired-session cleanup would be reasonable production follow-ups.
- SQLite is ideal for a self-contained assessment but not for horizontally scaled or serverless production workloads with concurrent writes. Prisma makes a later move to PostgreSQL less disruptive.
- The application does not include email verification, password reset, rate limiting, or audit logging. Those are important production controls but outside the requested scope.
- The task list uses local state after initial server rendering. At larger scale, pagination and URL-based server filtering would be preferable.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account and session |
| `POST` | `/api/auth/login` | Authenticate and create a session |
| `POST` | `/api/auth/logout` | Revoke the current session |
| `GET` | `/api/tasks` | List the current user's tasks |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/:taskId` | Edit a task or change its status |
| `DELETE` | `/api/tasks/:taskId` | Delete a task |

## Scope

This repository currently implements **Part 1** of the assignment. The Part 2 process flow and sprint implementation plan are intentionally not included yet.
