# UniLoop AI final demo runbook

## Safety and prerequisites

Use Node.js 22+, the existing lockfiles, and PostgreSQL. Repositories are independent siblings; no parent npm command is required. Do not show `.env`, terminals containing connection details, browser storage, authorization headers, passwords, API keys or provider prompts during presentation. Never reset a database, force-push a schema, or seed a populated/unknown target.

The configured real target was inspected safely in Phase 9. Its reviewed additive Phase 8 migration was applied without seeding or changing existing accounts/evidence. Its 11 accounts require password reset, and it lacks the golden identities, safe MC options and follow-up dataset. This is NOT a completed real-target golden-demo pass. Arrange approved account reset/provisioning and assessment options through a trusted operator; do not re-enable SHA-256 login or overwrite existing rows. Until then, use an explicitly disposable initialized demo target or offline mocks.

## Backend

From `UniLoop-Ai-backend-`:

```bash
npm ci
npm run prisma:validate
npm run prisma:generate
npm run build
node scripts/check-environment.mjs
```

Keep secret placeholders in local ignored `.env`, never in source:

```ini
DATABASE_URL=<approved PostgreSQL connection string>
JWT_SECRET=<rotated long random signing secret>
PORT=5001
CORS_ORIGINS=http://localhost:3000
LLM_PROVIDER=
LLM_API_KEY=
STORAGE_ENABLED=false
SEED_DISPOSABLE=false
SURVEY_STUDENT_URL=<optional public HTTPS form URL>
SURVEY_PROFESSOR_URL=<optional public HTTPS form URL>
```

For a temporary port-3001 frontend, use `CORS_ORIGINS=http://localhost:3000,http://localhost:3001`. The delimiter is comma. Production CORS must list the exact deployed frontend HTTPS origin. Provider identifier is blank (disabled) or `gemini`, not a human display name. Only Gemini needs `LLM_API_KEY`. Leave storage disabled; no live S3 request is needed.

On an existing compatible target, review migration status and additive SQL before `npx prisma migrate deploy`. The secret-safe checker captures migration output. Only a separately confirmed EMPTY disposable target may use `SEED_DISPOSABLE=true npm run prisma:seed`; immediately leave/restore the persistent flag false. The seed refuses populated targets and never deletes rows. Development-only account names and credentials are located in `prisma/seed.ts`; they are not production credentials.

Start backend:

```bash
npm run start
```

Expected health: `http://localhost:5001/api/v1/ai/status`; Swagger: `http://localhost:5001/api/v1/docs`. `node scripts/verify-real-reads.mjs` runs read-only checks with internal test tokens; it does not prove password login.

## Frontend

From `uniloop-frontend`, put only public configuration in ignored `.env`:

```ini
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_MOCK_SCENARIO=populated
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_STUDENT_SURVEY_URL=
NEXT_PUBLIC_PROFESSOR_SURVEY_URL=
```

Real-mode survey URLs belong to backend configuration; frontend survey variables are for mocks. Blank real survey URLs intentionally show a polished unavailable state.

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run validate:data
npm run build
npm run start
```

Expected frontend: `http://localhost:3000`. If occupied, preserve the existing server and use `npm run start -- --port 3001` with the matching backend CORS origin. Public variables are frozen at build time: restart development servers and rebuild/restart production after changes. Do not run TypeScript concurrently with a Next build.

## Two-minute golden sequence on a safe initialized demo target

1. Sign in as Dilnoza; confirm the real hydrated identity and Programming Fundamentals.
2. Open diagnostic/follow-up questions. Pre-submit delivery contains no correct answers or grading keys. Submit answers only; identity and grading come from backend.
3. Show persisted mastery, actual paired diagnostic/follow-up evidence, and ordered learning actions. Refresh to prove persistence. Do not promise a scripted 60% → 90%; actual evidence determines values.
4. Sign in as Azizbek. Show real cohort outcome/question aggregates, then approve/reject an advisory intervention and refresh.
5. Return to student career profile: backend readiness, collaborative-project gap, recommendation factors and saved/accepted state.
6. Explain consent; request review from an actual teaching professor. Show consent-scoped evidence and a manual professor endorsement decision. Disable review consent to demonstrate access removal.
7. Show surveys (configured public forms or truthful unavailable state). Automated authoring is intentionally unavailable, not a live AI generation feature.

Observed evidence, deterministic scores, AI explanations and professor decisions are separate responsibilities. AI cannot grade, authorize, verify evidence or approve interventions/endorsements.

## Fallback and restart

Fallback order: **real backend → deterministic AI fallback if Gemini fails → explicit mock mode only if backend/database is unavailable**. Real mode never silently falls back to mocks.

For an isolated offline demo, without interrupting the normal real build:

```bash
NEXT_OUTPUT_DIR=.next-qa-mock NEXT_PUBLIC_USE_MOCKS=true NEXT_PUBLIC_MOCK_SCENARIO=populated npm run dev -- --port 3002
```

Use the demo role chooser. Essential scenarios: `populated`, `empty`, `error`, `surveyUnavailable`; restart the mock server when changing scenario/URLs. Refresh resets in-memory mock mutations; role selection persists until logout. To switch the normal production app to mocks, set the public mode explicitly, rebuild, and restart. Do not present mocks as Neon-backed data.

To return a disposable real demo to a known state, use allowed assessment resubmissions/profile/consent/decision actions or initialize a NEW empty disposable database with the protected seed. There is no public reset endpoint. Do not delete the old database or overwrite a populated seed target. Regrading can clear dependent verification/endorsements; that is expected provenance protection.

## Symptoms and fixes

- Login rejects legacy accounts: trusted password reset/provisioning required; do not weaken KDF checks.
- Login/network failure: verify backend health and API prefix/port; no mock fallback occurs automatically.
- CORS failure: exact frontend origin must be in comma-delimited backend allowlist; restart backend.
- Wrong frontend mode/API: public values require rebuild/restart; verify the real login form versus demo role chooser.
- `429`: wait for `Retry-After`; repeated clicks are unnecessary.
- Expired token: centralized logout returns to login; authenticate again.
- Blank survey: configure a public HTTP(S) URL without embedded credentials and restart; unavailable is safe.
- Gemini failure: deterministic advisory fallback keeps demo usable; do not display provider error bodies or keys.
- Storage disabled: expected central demo behavior; text materials are database-backed.
- Missing MC options/follow-up on old target: additive schema migration does not author assessment data; trusted provisioning is needed.

## Deployment sequence (no external deployment performed)

1. Use approved database credentials and rotated JWT secret; do not seed production at startup.
2. Configure Render `CORS_ORIGINS` to the exact frontend HTTPS origin, storage/seed false, and optional Gemini settings.
3. Build backend image. Existing startup applies `prisma migrate deploy`, then starts Nest; Render `$PORT` is respected. Health path includes `/api/v1`. Swagger is currently exposed deliberately for the hackathon; restrict it before public production use if required.
4. Build frontend with mocks false and deployed backend `/api/v1` URL; no server secrets in public variables.
5. Check health, direct routes, browser CORS, both-role login and golden flow after deployment. Docker/provider deployment requires separate authorization and validation.

MVP limitations: localStorage bearer tokens/XSS risk, no refresh/revocation, public professor provisioning policy, process-local limits, open-book current-submission replacement, no immutable exam attempts, no automated assessment authoring or invented project artifact descriptions. See `phase9-qa.md` for the final evidence and external blockers.
