# Ash Transportation Management System — Backend

NestJS + MongoDB REST API powering the Ash Transportation admin website and
mobile app: authentication, challan creation/printing, reports, exports,
settings, and audit logging.

## Requirements

- Node.js 18+ (20 LTS recommended)
- MongoDB 6+ (local install, Docker, or MongoDB Atlas)

## Setup

```bash
cd ash-backend
npm install
cp .env.example .env
# edit .env: set MONGODB_URI, JWT secrets, and admin bootstrap credentials
```

## Run MongoDB locally (if you don't already have it)

```bash
# Docker option
docker run -d --name ash-mongo -p 27017:27017 -v ash_mongo_data:/data/db mongo:6
```

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

Challan numbers are generated from a single atomic MongoDB counter
document (`challan_counters` collection) using `findOneAndUpdate` with
`$inc`. The counter only ever increases — deleting a challan does **not**
decrement it — so a challan number can never be issued twice, matching
the requirement in the spec.

## Environment variables

See `.env.example` for the full list (Mongo URI, JWT secrets/expiry,
admin bootstrap credentials, challan number prefix/padding, CORS origins).

## Next steps

- `ash-website/` — React admin website (AG Grid reports, receipt printing)
- `ash-mobile/` — React Native Android app
- Deployment guide (Nginx + PM2 + AWS EC2) and printing guide will be
  provided alongside those.
