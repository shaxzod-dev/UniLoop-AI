# Real HTTP demo runbook

This runbook uses only fictional development data. Do not run the demo seed against Neon, a shared database, or a database containing user data.

## Start the application

1. Start the backend from `UniLoop-Ai-backend-` with `npm start`. It listens on port `5001` and serves `/api/v1`.
2. In `uniloop-frontend/.env`, confirm `NEXT_PUBLIC_USE_MOCKS=false` and `NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1`.
3. Start the frontend with `npm run dev` and open `http://localhost:3000`.

## Seed a disposable database only

Point `DATABASE_URL` at a confirmed empty local/disposable PostgreSQL database, apply migrations using the normal Prisma workflow, then run:

```bash
SEED_DISPOSABLE=true npm run seed:realistic-demo
```

The command refuses to run unless the disposable flag is present and the target has no users, courses, or opportunities. It does not reset or delete data.

## Additive fictional-profile provisioner

`npm run provision:fictional-demo` is separate from the bulk seed. It creates only a dedicated `fictional-demo-2026` namespace and requires both explicit provisioning flags plus an operator-supplied password. Use it only when the database owner has explicitly authorized additive fictional records for that target. It never deletes unrelated records.

## Verify real API data

After logging in, inspect browser network requests. Dashboard, courses, assessments, learning plans, opportunities, surveys, and feedback must originate from `http://localhost:5001/api/v1`; no frontend mock transport is used in HTTP mode.

## Development account handling

Development sign-in credentials are issued directly to the demo operator and are deliberately not stored in this repository. Never reuse them outside local development.
