import { getAssessment } from "@/features/assessments/api";
import { getDemoUser } from "@/features/auth/demo-users";
import { getClassInsight } from "@/features/class-insights/api";
import {
  getAcademicDashboard,
  getCourse,
  getCourses,
} from "@/features/courses/api";
import { getInterventions } from "@/features/interventions/api";
import { getLearningPlan } from "@/features/learning-plans/api";
import { getMastery } from "@/features/mastery/api";
import {
  getOpportunityDashboard,
  getRecommendations,
  updateCareerProfile,
} from "@/features/opportunities/api";
import {
  getReferralCandidates,
  getStudentEvidence,
} from "@/features/referrals/api";
import { getSurveys } from "@/features/surveys/api";
import { createApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { createMockDatabase } from "@/lib/mocks/database";
import { createMockTransport } from "@/lib/mocks/mock-transport";
import { ensure } from "@/lib/validation/assertions";
import { expectApiError } from "@/lib/validation/http-transport";

export async function validateScenarios(): Promise<void> {
  const db = createMockDatabase();
  const courseId = db.courses[0].id;
  const client = createApiClient(
    createMockTransport({ database: db, scenario: "empty", delayMs: 0 }),
  );
  for (const role of ["STUDENT", "PROFESSOR"] as const) {
    ensure(
      (await getCourses(role, undefined, client)).length === 0,
      "Empty courses",
    );
    ensure(
      (await getAcademicDashboard(role, undefined, client)).courseIds.length ===
        0,
      "Empty dashboard",
    );
    ensure(
      (await getCourse(courseId, role, undefined, client)).outcomes.length ===
        0,
      "Empty course detail",
    );
    ensure(
      (await getSurveys(role, undefined, client)).length === 0,
      "Empty surveys",
    );
  }
  ensure(
    (await getAssessment(db.assessments[0].id, undefined, client)).questions
      .length === 0,
    "Empty assessment",
  );
  ensure(
    (await getMastery(courseId, undefined, client)).outcomes.length === 0,
    "Empty mastery",
  );
  ensure(
    (await getLearningPlan(courseId, undefined, client)).tasks.length === 0,
    "Empty plan",
  );
  ensure(
    (await getClassInsight(courseId, undefined, client)).outcomes.length === 0,
    "Empty insights",
  );
  ensure(
    (await getInterventions(courseId, undefined, client)).length === 0,
    "Empty interventions",
  );
  ensure(
    (await getOpportunityDashboard(undefined, client)).recommendations
      .length === 0,
    "Empty opportunities",
  );
  ensure(
    (await getRecommendations(undefined, client)).length === 0,
    "Empty recommendations",
  );
  ensure(
    (await getReferralCandidates(undefined, client)).length === 0,
    "Empty candidates",
  );
  ensure(
    (await getStudentEvidence(getDemoUser("STUDENT").id, undefined, client))
      .academic.length === 0,
    "Empty student evidence",
  );
  const unavailableDb = createMockDatabase();
  const unavailableClient = createApiClient(
    createMockTransport({
      database: unavailableDb,
      scenario: "surveyUnavailable",
      delayMs: 0,
    }),
  );
  const unavailableSurveys = await getSurveys(
    "STUDENT",
    undefined,
    unavailableClient,
  );
  ensure(
    unavailableSurveys.length === 1 &&
      !unavailableSurveys[0].active &&
      unavailableSurveys[0].externalUrl === null,
    "Unavailable survey scenario",
  );
  const invalidUrlDb = createMockDatabase();
  invalidUrlDb.surveys[0].externalUrl = "not-a-url";
  const invalidUrlClient = createApiClient(
    createMockTransport({ database: invalidUrlDb, delayMs: 0 }),
  );
  ensure(
    (await getSurveys("STUDENT", undefined, invalidUrlClient))[0]
      .externalUrl === null,
    "Invalid survey URL becomes unavailable without breaking the response",
  );
  const failed = createApiClient(
    createMockTransport({ database: db, scenario: "error", delayMs: 0 }),
  );
  await expectApiError(
    () => getCourses("STUDENT", undefined, failed),
    "MOCK_ERROR",
  );
  await expectApiError(
    () => updateCareerProfile({ interests: [] }, failed),
    "MOCK_ERROR",
  );
  ensure(db.revision === 0, "Scenario errors never mutate the database");
  const controller = new AbortController();
  const pending = createMockTransport({ database: db, delayMs: 120 }).request({
    endpoint: endpoints.generateLearningPlan(courseId),
    role: "STUDENT",
    signal: controller.signal,
  });
  controller.abort();
  await expectApiError(() => pending, "ABORTED");
  ensure(db.revision === 0, "Aborted mutations never update state");
}
