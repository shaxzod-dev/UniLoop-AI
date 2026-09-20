# Phase 9 final QA evidence

## Result

Conditional pass. The full golden workflow is tested on the guarded, isolated disposable PostgreSQL target; the configured existing target is safely migrated and read-verified, but cannot yet run the password-login golden demo because all existing accounts require KDF reset/provisioning and the historic data lacks the required safe assessment/demo relationships. See [demo runbook](demo-runbook.md) for the approved next action.

## Environment and database

- Canonical local contract: frontend `http://localhost:3000`; backend `http://localhost:5001`; API `/api/v1`; Swagger `/api/v1/docs`.
- Backend `.env` was normalized privately to port 5001, `gemini`, disabled storage/seed, and a comma-delimited CORS list preserving existing origins plus port 3000. It is ignored/untracked; no values are recorded here.
- Frontend real API URL was normalized privately to the canonical API. Public variables require frontend rebuild/restart.
- Both `.env` files are ignored/untracked. Tracked files and current diffs were secret-scanned with no discovered credential values.
- The configured existing target was reachable, compatible and populated. Its reviewed additive `20260918120000_v1_integration` migration applied successfully with no reset, seed or data deletion. Final migration status is current.
- Read-only target checks: 19 HTTP checks for health/Swagger, canonical CORS, authenticated identity, role rejection, courses/dashboard, safe assessment delivery, mastery, professor insights/interventions, surveys and deleted/nonexistent JWT rejection. Internal short-lived test tokens were used only to verify reads and explicitly do not prove password login.
- Existing target readiness blocker: 11 existing accounts need reset/provisioning for scrypt login; no Dilnoza/Azizbek golden identities, safe MC options or follow-up assessment exist. No existing account, assessment, score, consent, recommendation or evidence was changed.

## Security and resilience repairs

- Strict environment validation: PostgreSQL URL category, JWT presence, port, provider vocabulary (`gemini` or disabled), optional Gemini/storage dependencies, seed flag and exact comma-separated CORS origins.
- Focused process-local per-IP limits: login 30/minute, registration 10, submission 60, endorsement creation 30. Live synthetic failed-login test received safe `429 RATE_LIMITED` plus `Retry-After`; no account was written. Gateway/distributed limits remain a production follow-up.
- Gemini key now travels in `x-goog-api-key`, not a URL. A single synthetic grounded request succeeded with runtime-validated output and recorded a successful run. The deterministic fallback remains tested by unit tests. AI cannot affect grades, identity, readiness, matching, consent, decisions or persistence.
- Storage-disabled startup validates and succeeds without S3 credentials. Survey adapter rejects credential-bearing URLs. Login normalizes before email validation, includes accessible error associations/live feedback and blocks duplicate pending submits.
- The font token recursion was fixed. Scrollable question tables are keyboard-focusable; insights now state that comparison requires paired evidence.

## Runtime and UI evidence

- Guarded disposable backend smoke: 79 real HTTP checks, including CORS, deterministic submission/replacement, persistence, consent withdrawal, verification invalidation, career/recommendation mutations, idempotent requests, approved/declined/needs-development professor decisions, surveys and deleted-user rejection.
- Live frontend feature APIs: 36 HTTP transport/Zod/adapter checks for both roles, authentication hydration, 401 clearing, unavailable workflow and exact invalidation.
- Browser: all 17 protected real-mode routes at 390px, 768px and 1440px; both-role form login, refresh `/auth/me`, wrong-role redirect, assessment submit, mobile dialog focus, logout, CORS and no horizontal overflow/unhandled exception. Representative screenshots are temporary validation artifacts under `/private/tmp/uniloop-phase9-screens-7LPANb`.
- Mock browser: same 17 routes with student/professor identities, mobile logout and tablet navigation; no overflow/error state. Mock API/data validation also covers populated, empty, error and unavailable-survey scenarios.
- Real mode does not silently use mock data. Controlled backend error, empty, loading and invalid-ID UI states are represented by the existing typed query/state components; contract and data validations cover their safe mapping. No raw backend error text is rendered.

## Deployment and deferred work

- `render.yaml` declares external production CORS, storage false and seed false; `$PORT` remains supported. Docker configuration exposes 5001 and deploys additive migrations before startup. Docker engine was unavailable locally, so no image build is claimed.
- Deployment is not authorized/performed. Follow the runbook’s exact sequence and validate live health/direct routes after deployment.
- Critical: none in the codebase after QA.
- High external blocker: approved real-target account reset/provisioning plus golden assessment/options/follow-up data is required for a real-target password-login demo.
- Medium: process-local limits are not distributed; bearer tokens are localStorage MVP security with no refresh/revocation; public professor provisioning remains a demo policy.
- Post-hackathon: gateway limits/observability, HttpOnly/BFF session, immutable high-stakes attempts, institutional provisioning/multi-tenancy, production Swagger restriction, deployment smoke and external S3/Gemini operational monitoring.
