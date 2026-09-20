import { getAssessment, submitAssessment } from "@/features/assessments/api";
import { getDemoUser } from "@/features/auth/demo-users";
import { getClassInsight } from "@/features/class-insights/api";
import {
  extractCourseOutcomes,
  generateCourseAssessment,
  getAcademicDashboard,
  getCourse,
  getCourses,
  uploadCourseMaterial,
} from "@/features/courses/api";
import {
  decideIntervention,
  generateProfessorGrowthPlan,
  getInterventions,
  suggestInterventions,
} from "@/features/interventions/api";
import {
  generateLearningPlan,
  getLearningPlan,
} from "@/features/learning-plans/api";
import { getMastery } from "@/features/mastery/api";
import {
  getOpportunityDashboard,
  getRecommendations,
  requestEndorsement,
  updateCareerProfile,
  updateRecommendation,
} from "@/features/opportunities/api";
import {
  calculateMatching,
  matchingWeights,
} from "@/features/opportunities/matching";
import {
  decideEndorsement,
  getReferralCandidates,
  getStudentEvidence,
} from "@/features/referrals/api";
import { getSurveys } from "@/features/surveys/api";
import { createApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { createMockDatabase } from "@/lib/mocks/database";
import { createMockTransport } from "@/lib/mocks/mock-transport";
import { ensure, validateMockData } from "@/lib/validation/mock-data";
import { expectApiError } from "@/lib/validation/http-transport";
import type { SubmissionRequest } from "@/types/assessment";

function assertSafePayload(payload: unknown) {
  const text = JSON.stringify(payload);
  for (const property of [
    "correctOptionId",
    "acceptedAnswers",
    "requiredTerms",
    "correctExplanation",
    "incorrectExplanation",
    "correctAnswer",
    "gradingRules",
  ]) {
    ensure(
      !text.includes('"' + property + '"'),
      "Student assessment leaked a grading key",
    );
  }
}
export async function validateGoldenDemo(): Promise<void> {
  const db = createMockDatabase();
  const transport = createMockTransport({ database: db, delayMs: 0 });
  const client = createApiClient(transport);
  const courseId = db.courses[0].id;
  const studentId = getDemoUser("STUDENT").id;
  const professorId = getDemoUser("PROFESSOR").id;
  const followUp = db.assessments[1];
  for (const role of ["STUDENT", "PROFESSOR"] as const) {
    ensure(
      (await getAcademicDashboard(role, undefined, client)).courseIds[0] ===
        courseId,
      "Academic dashboard shared course",
    );
    ensure(
      (await getCourses(role, undefined, client))[0].id === courseId,
      "Role course list",
    );
    ensure(
      (await getSurveys(role, undefined, client)).every(
        (survey) => survey.audience === role,
      ),
      "Role filtered surveys",
    );
  }
  ensure(
    (await getCourse(courseId, "STUDENT", undefined, client)).students
      .length === 1,
    "Student course detail only exposes own enrollment",
  );
  ensure(
    (await getCourse(courseId, "PROFESSOR", undefined, client)).students
      .length === 10,
    "Professor sees enrolled cohort",
  );
  for (const assessment of db.assessments) {
    assertSafePayload(
      await transport.request({
        endpoint: endpoints.assessment(assessment.id),
        role: "STUDENT",
      }),
    );
    assertSafePayload(await getAssessment(assessment.id, undefined, client));
  }
  const initial = await getMastery(courseId, undefined, client);
  ensure(
    initial.overallPercentage === 60 &&
      initial.outcomes[2].percentage === 35 &&
      initial.outcomes[3].percentage === 35,
    "Golden diagnostic gaps",
  );
  const before = await getClassInsight(courseId, undefined, client);
  ensure(
    before.outcomes[2].supportStudentIds.includes(studentId),
    "Professor sees the same call-sequence gap",
  );
  const careerBefore = await getOpportunityDashboard(undefined, client);
  ensure(
    careerBefore.profile.skills[0].percentage === 60 &&
      careerBefore.gaps[0].skillId === "skill-collaboration",
    "Academic evidence and collaboration gap",
  );
  ensure(
    careerBefore.recommendations.some(
      (item) => item.opportunity.type === "PEER",
    ) &&
      careerBefore.recommendations.some(
        (item) => item.opportunity.type === "MENTOR",
      ),
    "Consented peer and mentor recommendations",
  );
  ensure(
    careerBefore.recommendations.filter(
      (item) =>
        item.opportunity.type === "CLUB" || item.opportunity.type === "PROJECT",
    ).length === 3,
    "Three clubs or projects",
  );
  ensure(
    careerBefore.recommendations.filter(
      (item) =>
        item.opportunity.type === "INTERNSHIP" ||
        item.opportunity.type === "JOB",
    ).length === 6,
    "Six synthetic career roles",
  );
  ensure(
    Object.values(matchingWeights).reduce((sum, value) => sum + value, 0) === 1,
    "Matching weights sum to one",
  );
  const sample = careerBefore.recommendations[0];
  ensure(
    JSON.stringify(sample.matching) ===
      JSON.stringify(
        calculateMatching(
          careerBefore.profile,
          sample.opportunity,
          careerBefore.gaps,
        ),
      ),
    "Deterministic matching output",
  );
  ensure(
    (await getStudentEvidence(studentId, undefined, client)).academic[0]
      .overallPercentage === 60,
    "Same academic evidence in professor review",
  );
  ensure(
    (await getReferralCandidates(undefined, client))[0].request.status ===
      "REQUESTED",
    "Seeded endorsement request",
  );
  await expectApiError(
    () => getCourse("unknown-course", "STUDENT", undefined, client),
    "NOT_FOUND",
  );
  await expectApiError(
    () => getCourse("invalid id", "STUDENT", undefined, client),
    "VALIDATION_ERROR",
  );
  await expectApiError(
    () =>
      transport.request({
        endpoint: endpoints.insights(courseId),
        role: "STUDENT",
      }),
    "FORBIDDEN",
  );
  await expectApiError(
    () => transport.request({ endpoint: endpoints.studentCourses() }),
    "UNAUTHORIZED",
  );
  await expectApiError(
    () => getStudentEvidence(db.students[1].id, undefined, client),
    "FORBIDDEN",
  );
  await expectApiError(
    () => submitAssessment(followUp.id, { answers: [] }, client),
    "VALIDATION_ERROR",
  );
  await expectApiError(
    () => updateCareerProfile({ targetRole: "Missing role ID" }, client),
    "VALIDATION_ERROR",
  );
  const input: SubmissionRequest = {
    answers: followUp.questions.map((question) => {
      const rule = db.gradingRules[question.id];
      return rule.correctOptionId
        ? { questionId: question.id, optionId: rule.correctOptionId }
        : {
            questionId: question.id,
            text: rule.acceptedAnswers[0] ?? rule.requiredTerms.join(" va "),
          };
    }),
  };
  const result = await submitAssessment(followUp.id, input, client);
  ensure(
    result.scorePercentage === 100 &&
      result.feedback.every((item) => item.correct),
    "Follow-up grading result",
  );
  const improved = await getMastery(courseId, undefined, client);
  ensure(
    improved.overallPercentage === 90 && improved.outcomes[2].change === 55,
    "Follow-up improves the same outcomes",
  );
  const after = await getClassInsight(courseId, undefined, client);
  ensure(
    !after.outcomes[2].supportStudentIds.includes(studentId) &&
      after.outcomes[2].followUpStudentCount ===
        before.outcomes[2].followUpStudentCount + 1,
    "Professor insights update from student mutation",
  );
  ensure(
    (await getLearningPlan(courseId, undefined, client)).tasks.every(
      (item) => item.status === "COMPLETED",
    ),
    "Plan updates after successful follow-up",
  );
  ensure(
    (await generateLearningPlan(courseId, client)).studentId === studentId,
    "Learning plan generation retains identity",
  );
  const careerAfter = await getOpportunityDashboard(undefined, client);
  ensure(
    careerAfter.profile.skills[0].percentage === 90 &&
      careerAfter.profile.skills[0].sources.some(
        (item) => item.id === followUp.id,
      ),
    "Improved assessment evidence reaches career profile",
  );
  ensure(
    careerAfter.gaps.some((item) => item.skillId === "skill-collaboration"),
    "Missing collaborative evidence remains truthful",
  );
  ensure(
    (await getStudentEvidence(studentId, undefined, client)).academic[0]
      .overallPercentage === 90,
    "Endorsement evidence updates consistently",
  );
  const recommendation = careerAfter.recommendations.find(
    (item) => item.opportunity.type === "PROJECT",
  );
  ensure(recommendation, "Targeted collaboration project recommendation");
  for (const status of ["SAVED", "ACCEPTED", "DISMISSED"] as const) {
    await updateRecommendation(recommendation.id, { status }, client);
    ensure(
      (await getRecommendations(undefined, client)).find(
        (item) => item.id === recommendation.id,
      )?.status === status,
      "Recommendation mutation persists",
    );
  }
  const interventions = await getInterventions(courseId, undefined, client);
  ensure(
    (
      await decideIntervention(
        courseId,
        interventions[0].id,
        { status: "APPROVED" },
        client,
      )
    ).status === "APPROVED",
    "Professor-controlled intervention approval",
  );
  await decideIntervention(
    courseId,
    interventions[1].id,
    { status: "REJECTED" },
    client,
  );
  ensure(
    (await getInterventions(courseId, undefined, client))[1].status ===
      "REJECTED",
    "Intervention rejection persists",
  );
  ensure(
    (await suggestInterventions(courseId, client))[0].status === "APPROVED",
    "Suggestion retrieval does not override professor decisions",
  );
  ensure(
    (await generateProfessorGrowthPlan(client)).professorId === professorId,
    "Professor growth plan",
  );
  const material = await uploadCourseMaterial(
    courseId,
    {
      title: "Rekursiya mashqi",
      content: "Chaqiriqlarni jadval orqali kuzating.",
    },
    client,
  );
  ensure(
    (await getCourse(courseId, "PROFESSOR", undefined, client)).materials.some(
      (item) => item.id === material.id,
    ),
    "Course material mutation persists",
  );
  ensure(
    (await extractCourseOutcomes(courseId, client)).length === 4,
    "Deterministic mock outcome extraction",
  );
  assertSafePayload(
    await generateCourseAssessment(courseId, "FOLLOW_UP", client),
  );
  await updateCareerProfile(
    {
      consent: {
        discoverable: false,
        peerRecommendations: false,
        professorEvidenceReview: false,
      },
      interests: ["Loyiha yaratish"],
    },
    client,
  );
  ensure(
    !(await getRecommendations(undefined, client)).some(
      (item) => item.opportunity.type === "PEER",
    ),
    "Peer consent withdrawal filters recommendations",
  );
  await expectApiError(
    () => getStudentEvidence(studentId, undefined, client),
    "FORBIDDEN",
  );
  ensure(
    (await getReferralCandidates(undefined, client)).length === 0,
    "Evidence consent withdrawal hides candidates",
  );
  await expectApiError(
    () =>
      requestEndorsement(
        {
          professorId,
          targetRole: careerAfter.profile.targetRole,
          consentToReview: false,
        },
        client,
      ),
    "FORBIDDEN",
  );
  const request = await requestEndorsement(
    {
      professorId,
      targetRole: careerAfter.profile.targetRole,
      consentToReview: true,
    },
    client,
  );
  ensure(
    (await getStudentEvidence(studentId, undefined, client)).reviewConsent,
    "Explicit endorsement request re-enables review consent",
  );
  const decided = await decideEndorsement(
    {
      requestId: request.id,
      status: "NEEDS_DEVELOPMENT",
      feedback: "Jamoaviy loyiha hissasini hujjatlashtiring.",
    },
    client,
  );
  ensure(
    decided.status === "NEEDS_DEVELOPMENT" && decided.history.length === 2,
    "Professor endorsement decision and history persist",
  );
  await expectApiError(
    () =>
      decideEndorsement({ requestId: request.id, status: "APPROVED" }, client),
    "VALIDATION_ERROR",
  );
  const newRequest = await requestEndorsement(
    {
      professorId,
      targetRole: careerAfter.profile.targetRole,
      opportunityId: recommendation.opportunity.id,
      consentToReview: true,
    },
    client,
  );
  ensure(
    newRequest.id !== request.id && db.endorsements.length === 2,
    "New endorsement request updates state",
  );
  validateMockData(db);
  ensure(
    createMockDatabase().masteries[0].overallPercentage === 60,
    "Fresh database restores deterministic seed state",
  );
}
