# Ash Transportation Management System — Backend

NestJS + PostgreSQL (Prisma) REST API powering the Ash Transportation admin
website and mobile app: authentication, challan creation/printing, reports,
exports, settings, and audit logging.

## Requirements

- Node.js 18+ (20 LTS recommended)
- PostgreSQL 14+ (local install, Docker, or managed like RDS/Supabase)

## Setup

```bash
cd ash-backend
npm install
cp .env.example .env
# edit .env: set DATABASE_URL, JWT secrets, and admin bootstrap credentials
```

## Run PostgreSQL locally (if you don't already have it)

```bash
# Docker option
docker run -d --name ash-postgres -p 5432:5432 \
  -e POSTGRES_USER=ash_user -e POSTGRES_PASSWORD=change_this_password \
  -e POSTGRES_DB=ash_transportation \
  -v ash_pg_data:/var/lib/postgresql/data \
  postgres:16
```

## Apply the database schema

```bash
npx prisma generate        # generate the Prisma client
npx prisma migrate dev --name init   # creates tables from prisma/schema.prisma
```

In production use `npm run prisma:migrate:deploy` instead of `migrate dev`
(no interactive prompts, safe for CI/CD).

## Seed the first admin user

This creates the admin account defined in `.env` (`ADMIN_EMAIL` /
`ADMIN_PASSWORD`) if no user exists yet, plus default settings.

```bash
npm run seed
```

## Run the API

```bash
npm run start:dev      # development, hot reload
npm run build && npm run start:prod   # production
```

By default the API runs at `http://localhost:3000/api/v1` and interactive
Swagger docs are at `http://localhost:3000/api/v1/docs`.

## Authentication flow

1. `POST /api/v1/auth/login` with `{ email, password, rememberMe }` →
   returns `accessToken` (short-lived) + `refreshToken` (long-lived).
2. Send `Authorization: Bearer <accessToken>` on every subsequent request.
3. When the access token expires, `POST /api/v1/auth/refresh` with
   `{ refreshToken }` to get a new pair.
4. `POST /api/v1/auth/logout` with `{ refreshToken }` to revoke it (omit
   the token to revoke all sessions for that user).

The website and mobile app both use this exact same flow.

## Key modules

| Module      | Responsibility                                                        |
|-------------|-------------------------------------------------------------------------|
| `auth`      | Login, JWT access/refresh tokens, guards                               |
| `users`     | Admin user accounts, profile, password change                         |
| `challans`  | Create/edit/delete/reprint challans, atomic never-reused numbering    |
| `reports`   | Filtered, paginated, sortable challan listing for the Reports screen  |
| `export`    | CSV / Excel / PDF export + JSON preview before download                |
| `settings`  | Company info, printer configuration                                    |
| `audit-logs`| Immutable log of every create/update/delete/print/login action        |
| `dashboard` | Today/month/year counts, recent challans, latest activity              |

## Challan numbering guarantee

Challan numbers are generated from a single atomic Postgres counter row
(`challan_counters` table) using an `upsert` with `sequence: { increment: 1 }`,
which Prisma compiles to an atomic `INSERT ... ON CONFLICT DO UPDATE`. The
counter only ever increases — deleting a challan does **not** decrement
it — so a challan number can never be issued twice, matching the
requirement in the spec.

## Migrated from MongoDB — what changed

This backend originally used MongoDB/Mongoose and was migrated to
PostgreSQL/Prisma. If you're integrating an existing frontend built against
the old API, note:

- All ids are now UUID strings under the `id` field (was `_id` under Mongo).
- Populated relations (e.g. a challan's creator) now come back as
  `createdByUser: { id, name, email }` instead of replacing `createdBy`
  in place — the raw foreign key still exists separately as `createdBy`
  (a plain user id string).
- Full-text search on challans now uses SQL `ILIKE` (`contains`,
  case-insensitive) instead of a MongoDB text index — same behavior from
  the API consumer's point of view.

## Environment variables

See `.env.example` for the full list (Postgres connection string, JWT
secrets/expiry, admin bootstrap credentials, challan number prefix/padding,
CORS origins).

## Prisma cheatsheet

```bash
npx prisma studio              # visual DB browser
npx prisma migrate dev --name <change>   # create + apply a new migration (dev)
npm run prisma:migrate:deploy  # apply pending migrations (production/CI)
npx prisma generate            # regenerate the client after schema changes
```

## Next steps

- `ash-website/` — React admin website (AG Grid reports, receipt printing)
- `ash-mobile/` — React Native Android app
- Deployment guide (Nginx + PM2 + AWS EC2) provided separately.
