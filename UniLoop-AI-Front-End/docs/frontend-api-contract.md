# UniLoop frontend API contract — Phase 8

## Architecture

UI → feature hook → feature API → central client → selected HTTP/mock transport → Zod validation → DTO adapter → domain model. No component fetches, UI-built endpoints, or production fixture/database imports. Endpoints and query keys are centralized under src/lib/api. Source feature contracts and the sibling backend docs/api-v1.md define the canonical payloads.

Defaults: frontend http://localhost:3000; backend http://localhost:5001; NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1. Set NEXT_PUBLIC_USE_MOCKS=false for real authentication/data, true for the offline role-selection demo. NEXT_PUBLIC variables are frozen at Next build time; rebuild to switch production modes. Invalid environment configuration fails explicitly, never silently switches real mode to mocks. Actual .env credentials are not copied into documentation.

Every response is {data:DTO}, including lists. No double wrapping. Public DTOs are camelCase and dates are ISO-8601. HTTP errors are {error:{code,message,details}}. Frontend chooses centralized Uzbek text by stable code/status and does not display untrusted server messages. CONFLICT, INTERNAL_ERROR and UNAVAILABLE supplement existing localized errors.

## Authentication and IDs

POST /auth/login receives {email,password}; returns {accessToken,user} inside data. GET /auth/me returns {id,profileId,fullName,role,university,faculty,avatarLabel}. id is User ID; profileId is StudentProfile/ProfessorProfile ID. Summary id, submission studentId, course professorId, dashboard legacy userId and resource cache identities refer to profile IDs.

HTTP mode persists only the access token under uniloop-http-session. Stored data is type-checked and cannot inject a saved role/user. Refresh validates /auth/me before protected queries become enabled. Login and role routing use the backend identity. Session changes clear TanStack Query cache; logout clears role, identity and token. Central transport adds Bearer only when present. A 401 clears the matching session and navigates to /login; a stale request cannot clear a newly signed-in token. Login failure without a token stays on the form with localized feedback.

Mock mode retains uniloop-demo-session role choice and demo identities. HTTP mode never derives a backend profile ID from demo users. Client guards are navigation UX only; Nest is the authorization boundary.

Eight-hour bearer access tokens, no refresh/revocation flow. localStorage is a deliberate hackathon compromise: XSS can steal the token. Production should use an HttpOnly/BFF session strategy, rate limits and explicit account provisioning. Public backend registration cannot create ADMIN, but professor self-registration remains a development MVP policy, not institutional authorization.

Unknown backend university/faculty names are empty and organization IDs null. StudentProfile.universityId is an enrollment identifier, not an organization foreign key. No fictitious organization is substituted.

## Canonical endpoints

Paths below are relative to /api/v1. All feature routes require backend identity and role; course/assessment routes additionally enforce enrollment or professor ownership.

| Feature                            | Endpoint                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| Student dashboard/courses/detail   | GET /students/me/dashboard; /students/me/courses; /students/me/courses/:courseId       |
| Professor dashboard/courses/detail | GET /professors/me/dashboard; /professors/me/courses; /professors/me/courses/:courseId |
| Safe student/professor assessment  | GET /students/me/assessments/:id; /professors/me/assessments/:id                       |
| Answers-only submission            | POST /students/me/assessments/:id/submissions                                          |
| Mastery/current plan               | GET /students/me/mastery/:courseId; /students/me/learning-plans/:courseId              |
| Generate learning plan             | POST /students/me/learning-plans/:courseId                                             |
| Insights/interventions             | GET /professors/me/courses/:courseId/insights; /interventions                          |
| Suggest intervention               | POST /professors/me/courses/:courseId/interventions                                    |
| Decide intervention                | PATCH /professors/me/courses/:courseId/interventions/:interventionId                   |
| Persisted/generate growth plan     | GET/POST /professors/me/growth-plans                                                   |
| Text material upload               | POST /professors/me/courses/:courseId/materials                                        |
| Opportunity dashboard/profile      | GET /students/me/opportunity-dashboard; PATCH /students/me/career-profile              |
| Recommendations/status             | GET /students/me/recommendations; PATCH /students/me/recommendations/:id               |
| Request endorsement                | POST /students/me/endorsement-requests                                                 |
| Referral candidates/evidence       | GET /professors/me/referral-candidates; /professors/me/students/:studentId/evidence    |
| Professor endorsement decision     | POST /professors/me/endorsements                                                       |
| Survey configuration               | GET /surveys?audience=STUDENT or PROFESSOR                                             |

Automated outcome extraction and assessment generation call owner-scoped professor endpoints and return controlled UNAVAILABLE (503) in HTTP mode. The assessment screen explicitly states this limitation. Mock authoring handlers remain available for offline demonstrations. No fake generated questions or fallback demo data are supplied in real mode.

## Domain DTOs and evidence

Course summary: {id,title,code,professorId,studentCount,outcomeCount}. Detail adds description, professor, students, enrollments, outcomes, materials, assessments and latestFeedback. Student detail contains only their own student/enrollment entry. Assessment summaries include actual submissionCount (0/1 for the current student; real cohort total for professor), not guessed participation.

Assessment: {id,courseId,type,title,estimatedMinutes,questions:[{id,outcomeId,type,prompt,options:[{id,text}]}]}. Student delivery never requires or contains correctAnswer/correct flags. The domain form uses text for short-answer content; the feature API converts it to canonical wire answer. Wire body: {answers:[{questionId,optionId}|{questionId,answer}]}. Client score/identity fields are forbidden.

Submission result provides own submission ID/profile ID, submittedAt, scorePercentage, per-question feedback, outcomeImpacts, deterministic explanation and nextRecommendedAction. Correct-answer feedback is returned only after submission. One current submission is atomically replaced on resubmission; this is an open-book development/practice flow, not a secure examination attempt policy.

Mastery: per-outcome percentage, public level, diagnosticPercentage:number|null, followUpPercentage:number|null, change, evidence[], misconception IDs/descriptions and next action. Overall averages assessed outcomes. Unassessed numeric 0 is a compatibility placeholder with empty evidence; UI shows absent evidence as unassessed/—. Diagnostic/follow-up comparison requires paired real evidence and a follow-up newer than the latest diagnostic. Cohort improvement is null without valid pairs; charts do not replace missing follow-up with 0. Unsupported misconception data is explicitly empty.

Learning plan: persisted ID, profile/course IDs, createdAt, ordered typed tasks with status, reason, actionTarget and planning estimate. Backend generated tasks map to PRACTICE and NOT_STARTED/COMPLETED. Historic plans are preserved; current plan reloads after grading. Professor growth plan loads persisted goals on page refresh and mutation invalidates its exact key.

Public enum vocabulary is stable. Backend centrally maps PERSON→PEER; VIEWED→SAVED; INTERESTED→ACCEPTED; LEARNING_FOUNDATIONS→FOUNDATION; PENDING→REQUESTED; ENDORSED→APPROVED; PLANNED→SUGGESTED; ACTIVE/COMPLETED→APPROVED; REJECTED→REJECTED. Mastery maps MASTERED→MASTERED, DEVELOPING→DEVELOPING, NEEDS_ATTENTION→NEEDS_SUPPORT, NOT_ASSESSED→NEEDS_SUPPORT with absent evidence. PROFICIENT remains accepted frontend presentation vocabulary, not a new backend evidence level. New migration preserves distinctions for MENTOR, INTERNSHIP, DECLINED and rejection.

## Career and consent

Dashboard: {profile,gaps,projects,recommendations,endorsementRequests,availableProfessors}. availableProfessors contains actual enrolled-course teachers; endorsement UI selects a real profile ID rather than hardcoding Azizbek. Projects are [] when actual artifact metadata is unavailable; project skill references do not become fabricated descriptions.

Five supported target-role IDs: role-frontend-developer, role-backend-developer, role-data-analyst, role-fullstack-developer, role-devops-engineer. Role selector supplies role ID + label together; server validates the ID and owns display vocabulary/readiness. Consent is {discoverable,peerRecommendations,professorEvidenceReview}. Unknown profile is a truthful unavailable state, not mock identity.

Every recommendation contains its opportunity, bounded matching breakdown, explanation and NEW/SAVED/ACCEPTED/DISMISSED state. Weights: role alignment 30%, demonstrated skill evidence 25%, relevant gaps 20%, collaboration fit 15%, verification strength 10%. Backend determines real scores/readiness. Frontend calculateMatching is used by mock read models only; components never recompute real server scores.

Endorsement requests include student/professor profile IDs, opportunity|null, current target role, explicit consent, status, feedback, requestedAt and history. Equivalent pending requests are idempotent. Professor evidence requires live global review consent, request consent and a valid teaching relationship; withdrawal affects future server reads and decisions immediately. UI consent warnings and always-refetched evidence/candidate queries remain intact. Client guards do not grant evidence access or verification.

Optional Gemini explanations/next-step/gap/draft endpoints are exposed by the backend; current UI uses grounded deterministic descriptions. AI never supplies grade, mastery, readiness, matching, consent, persisted decisions or verification. No Gemini credentials were required for real API integration.

## Surveys and cache

Phase 7 loading/error/empty/inactive/missing-link/invalid-link/active presentations are preserved. HTTP survey URLs come only from SURVEY_STUDENT_URL/SURVEY_PROFESSOR_URL on the backend; supported HTTP(S) URLs without embedded credentials are normalized. Missing/invalid values yield inactive/null. Frontend adapter validates links again and links open with target=_blank + rel=noopener noreferrer. Offline public survey URL variables/scenarios remain supported; surveyUnavailable still works.

Query keys are profile/role scoped. Mutation invalidation uses exact keys: grading → assessment/mastery/plan/dashboard/course/opportunity/recommendations; intervention → that course's interventions; career profile/consent → current student's opportunity/recommendations; endorsement → dashboard + specified professor candidate/evidence; professor decision → current professor's candidate/evidence and affected student opportunity dashboard. Mock cross-role dependencies remain for the shared offline database. Real role switches clear cache, so no guessed cross-role demo IDs are invalidated in HTTP mode. This is not cross-browser push synchronization; server access is always rechecked.

## Run and validate

Backend needs PostgreSQL + JWT_SECRET. It starts without S3 or Gemini credentials when storage/LLM are disabled. Apply the additive v1 migration on a known target. Seed is gated by SEED_DISPOSABLE=true and refuses populated targets; it deletes no user data. Development-only demo accounts: student1@uniloop.local (Dilnoza), professor@uniloop.local (Azizbek); password123. See backend docs/api-v1.md for full server policy.

Frontend serial validation: npm run lint; npx tsc --noEmit; npm run validate:data; npm run build; git diff --check. Do not run tsc concurrently with Next build. If only Turbopack listen EPERM prevents the build, use npm run build -- --webpack and report the infrastructure restriction separately.

Offline validations cover references, safe reads, fixture DTOs, mock/HTTP equivalence, scenarios, grading, consent, recommendations, headers, 401 callbacks and scoped invalidation.

Live mutating contract smoke (confirmed disposable server only): SMOKE_DISPOSABLE=true node scripts/validate-backend.mjs. Uses real feature APIs/central client/Zod/adapters across both roles; verifies session profile IDs, bearer headers, grading, mastery, plans, insights, decisions, consent, referrals, surveys, localized unavailable states, logout and 401 session clearing. Backend scripts/smoke-v1.mjs separately verifies database-level persistence/concurrency/security against its isolated test database.

Do not claim desktop/mobile visual, Gemini provider, Docker/deployment or a user's shared database runtime checks from API/unit builds alone. Current limitations include automated authoring, project artifact metadata, immutable attempts, token revocation/refresh, production cookie/session security, provisioning/rate limiting and multi-tenant institutional modeling.
