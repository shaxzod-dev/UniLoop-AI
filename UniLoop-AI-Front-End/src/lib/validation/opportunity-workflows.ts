import { QueryClient, type QueryKey } from "@tanstack/react-query";
import { getDemoUser } from "@/features/auth/demo-users";
import {
  getOpportunityDashboard,
  getRecommendations,
  requestEndorsement,
  updateCareerProfile,
  updateRecommendation,
} from "@/features/opportunities/api";
import {
  careerProfileMutationKeys,
  recommendationMutationKeys,
  endorsementMutationKeys,
} from "@/features/opportunities/invalidation";
import {
  decideEndorsement,
  getReferralCandidates,
  getStudentEvidence,
} from "@/features/referrals/api";
import { createApiClient } from "@/lib/api/client";
import { invalidateQueryKeys, queryKeys } from "@/lib/api/query-keys";
import { createMockDatabase } from "@/lib/mocks/database";
import { createMockTransport } from "@/lib/mocks/mock-transport";
import { ensure } from "@/lib/validation/assertions";
import { expectApiError } from "@/lib/validation/http-transport";

async function verifyCacheScope(
  keys: readonly QueryKey[],
  unrelated: readonly QueryKey[],
) {
  const cache = new QueryClient();
  for (const key of [...keys, ...unrelated])
    cache.setQueryData(key, { cached: true });
  await invalidateQueryKeys(cache, keys);
  ensure(
    keys.every((key) => cache.getQueryState(key)?.isInvalidated),
    "Every affected opportunity/referral query is invalidated",
  );
  ensure(
    unrelated.every((key) => !cache.getQueryState(key)?.isInvalidated),
    "Unrelated academic and opportunity/referral queries stay cached",
  );
  cache.clear();
}

export async function validateOpportunityWorkflows(): Promise<void> {
  const db = createMockDatabase();
  const client = createApiClient(
    createMockTransport({ database: db, delayMs: 0 }),
  );
  const initial = await getOpportunityDashboard(undefined, client);
  const professorId = getDemoUser("PROFESSOR").id;
  const studentId = initial.profile.studentId;
  const candidates = await getReferralCandidates(undefined, client);
  const evidence = await getStudentEvidence(studentId, undefined, client);
  ensure(
    candidates[0].readinessStage === initial.profile.readinessStage &&
      evidence.readinessStage === initial.profile.readinessStage,
    "Student and professor share the same computed readiness",
  );
  ensure(
    evidence.targetRole === initial.profile.targetRole &&
      evidence.aiSummary.length > 0 &&
      evidence.gaps[0]?.skillId === "skill-collaboration",
    "Professor receives role, evidence summary and the collaborative-project gap",
  );
  const profile = await updateCareerProfile(
    {
      targetRole: `${initial.profile.targetRole} — veb-loyihalar`,
      targetRoleId: initial.profile.targetRoleId,
      interests: ["Veb-loyihalar", "Ta’lim texnologiyalari"],
    },
    client,
  );
  ensure(
    profile.targetRole.endsWith("veb-loyihalar") &&
      profile.interests[0] === "Veb-loyihalar" &&
      profile.targetRoleId === initial.profile.targetRoleId,
    "Profile editor persists the named goal, interests and structured direction together",
  );
  await updateCareerProfile(
    {
      consent: {
        discoverable: false,
        peerRecommendations: false,
        professorEvidenceReview: false,
      },
    },
    client,
  );
  ensure(
    !(await getRecommendations(undefined, client)).some(
      (item) => item.opportunity.type === "PEER",
    ),
    "Peer recommendation withdrawal is enforced by the API result",
  );
  ensure(
    (await getReferralCandidates(undefined, client)).length === 0,
    "Professor cannot see candidates after evidence-review consent withdrawal",
  );
  await expectApiError(
    () => getStudentEvidence(studentId, undefined, client),
    "FORBIDDEN",
  );
  const revisionBeforeDenied = db.revision;
  await expectApiError(
    () =>
      requestEndorsement(
        { professorId, targetRole: profile.targetRole, consentToReview: false },
        client,
      ),
    "FORBIDDEN",
  );
  ensure(
    db.revision === revisionBeforeDenied,
    "Request without consent does not mutate state",
  );
  const countBeforeRequest = db.endorsements.length;
  const requested = await requestEndorsement(
    { professorId, targetRole: profile.targetRole, consentToReview: true },
    client,
  );
  const revisionAfterRequest = db.revision;
  const repeated = await requestEndorsement(
    { professorId, targetRole: profile.targetRole, consentToReview: true },
    client,
  );
  ensure(
    requested.id === repeated.id &&
      db.endorsements.length === countBeforeRequest + 1 &&
      db.revision === revisionAfterRequest,
    "Repeated pending requests are idempotent",
  );
  ensure(
    (
      await getStudentEvidence(studentId, undefined, client)
    ).requestIds.includes(requested.id),
    "Explicit request restores professor review consent",
  );
  await updateCareerProfile(
    {
      consent: {
        discoverable: true,
        peerRecommendations: true,
        professorEvidenceReview: true,
      },
    },
    client,
  );
  const persisted = (await getOpportunityDashboard(undefined, client)).profile
    .consent;
  ensure(
    persisted.discoverable &&
      persisted.peerRecommendations &&
      persisted.professorEvidenceReview,
    "All three privacy preferences persist",
  );
  const recommendations = await getRecommendations(undefined, client);
  for (const status of ["SAVED", "ACCEPTED", "DISMISSED"] as const) {
    await updateRecommendation(recommendations[0].id, { status }, client);
    const updated = await getRecommendations(undefined, client);
    ensure(
      updated.find((item) => item.id === recommendations[0].id)?.status ===
        status &&
        updated.find((item) => item.id === recommendations[1].id)?.status ===
          "NEW",
      "Recommendation actions persist without changing unrelated recommendations",
    );
  }
  for (const status of ["APPROVED", "DECLINED", "NEEDS_DEVELOPMENT"] as const) {
    const decisionDb = createMockDatabase();
    const decisionClient = createApiClient(
      createMockTransport({ database: decisionDb, delayMs: 0 }),
    );
    const requestId = decisionDb.endorsements[0].id;
    const decided = await decideEndorsement(
      {
        requestId,
        status,
        feedback: "Jamoaviy loyiha hissasini hujjatlashtiring.",
      },
      decisionClient,
    );
    ensure(
      decided.status === status &&
        decided.history.length === 2 &&
        Boolean(decided.professorFeedback),
      "Every professor decision records status, history and feedback",
    );
    ensure(
      (await getOpportunityDashboard(undefined, decisionClient))
        .endorsementRequests[0].status === status,
      "Professor decision is visible to the student",
    );
    await expectApiError(
      () => decideEndorsement({ requestId, status }, decisionClient),
      "VALIDATION_ERROR",
    );
  }
  const failedDb = createMockDatabase();
  const failed = createApiClient(
    createMockTransport({ database: failedDb, scenario: "error", delayMs: 0 }),
  );
  await expectApiError(
    () => getOpportunityDashboard(undefined, failed),
    "MOCK_ERROR",
  );
  await expectApiError(
    () => getReferralCandidates(undefined, failed),
    "MOCK_ERROR",
  );
  await expectApiError(
    () => getStudentEvidence(studentId, undefined, failed),
    "MOCK_ERROR",
  );
  await expectApiError(
    () => updateCareerProfile({ interests: [] }, failed),
    "MOCK_ERROR",
  );
  await expectApiError(
    () =>
      updateRecommendation(recommendations[0].id, { status: "SAVED" }, failed),
    "MOCK_ERROR",
  );
  await expectApiError(
    () =>
      requestEndorsement(
        { professorId, targetRole: profile.targetRole, consentToReview: true },
        failed,
      ),
    "MOCK_ERROR",
  );
  await expectApiError(
    () =>
      decideEndorsement(
        { requestId: failedDb.endorsements[0].id, status: "APPROVED" },
        failed,
      ),
    "MOCK_ERROR",
  );
  ensure(
    failedDb.revision === 0,
    "Failed opportunity workflows never mutate data",
  );
  const academic = queryKeys.mastery.byCourse(studentId, db.courses[0].id);
  const otherStudent = "student-other";
  const otherProfessor = "professor-other";
  const unrelated = [
    academic,
    queryKeys.opportunities.dashboard(otherStudent),
    queryKeys.referrals.evidence(professorId, otherStudent),
    queryKeys.referrals.candidates(otherProfessor),
  ];
  await verifyCacheScope(
    careerProfileMutationKeys(studentId, professorId),
    unrelated,
  );
  await verifyCacheScope(recommendationMutationKeys(studentId), [
    ...unrelated,
    queryKeys.referrals.candidates(professorId),
  ]);
  await verifyCacheScope(endorsementMutationKeys(studentId, professorId), [
    ...unrelated,
    queryKeys.opportunities.recommendations(studentId),
  ]);
}
