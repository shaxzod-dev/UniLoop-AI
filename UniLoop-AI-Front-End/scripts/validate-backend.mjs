import assert from "node:assert/strict";
import fs from "node:fs";
import Module, { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

assert.equal(
  process.env.SMOKE_DISPOSABLE,
  "true",
  "Mutating frontend API smoke requires a confirmed disposable backend",
);
const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1";
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Local disposable backend only",
);
process.env.NEXT_PUBLIC_USE_MOCKS = "false";
process.env.NEXT_PUBLIC_API_URL = base;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireSource = createRequire(import.meta.url);
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(
    this,
    request.startsWith("@/")
      ? path.join(root, "src", request.slice(2))
      : request,
    ...args,
  );
};
Module._extensions[".ts"] = function (loaded, filename) {
  loaded._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: filename,
    }).outputText,
    filename,
  );
};
const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};
const { useAuthStore, sessionProfileId } = requireSource(
  "../src/features/auth/store.ts",
);
const { login, getIdentity } = requireSource("../src/features/auth/api.ts");
const {
  getAcademicDashboard,
  getCourses,
  getCourse,
  uploadCourseMaterial,
  extractCourseOutcomes,
  generateCourseAssessment,
} = requireSource("../src/features/courses/api.ts");
const { getAssessment, submitAssessment } = requireSource(
  "../src/features/assessments/api.ts",
);
const { getMastery } = requireSource("../src/features/mastery/api.ts");
const { getLearningPlan, generateLearningPlan } = requireSource(
  "../src/features/learning-plans/api.ts",
);
const { getClassInsight } = requireSource(
  "../src/features/class-insights/api.ts",
);
const {
  getInterventions,
  decideIntervention,
  suggestInterventions,
  getProfessorGrowthPlan,
  generateProfessorGrowthPlan,
} = requireSource("../src/features/interventions/api.ts");
const {
  getOpportunityDashboard,
  getRecommendations,
  updateCareerProfile,
  updateRecommendation,
  requestEndorsement,
} = requireSource("../src/features/opportunities/api.ts");
const { getReferralCandidates, getStudentEvidence, decideEndorsement } =
  requireSource("../src/features/referrals/api.ts");
const { getSurveys } = requireSource("../src/features/surveys/api.ts");
const { ApiError } = requireSource("../src/lib/api/errors.ts");
let checks = 0;
async function validate(action) {
  const result = await action;
  checks++;
  return result;
}
async function signIn(email) {
  const session = await validate(login({ email, password: "password123" }));
  useAuthStore.getState().setSession(session.accessToken, session.user);
  const me = await validate(getIdentity());
  assert.deepEqual(me, session.user);
  return session;
}
try {
  const student = await signIn("student1@uniloop.local");
  assert.equal(sessionProfileId(), "student-1");
  assert.equal(student.user.fullName, "Dilnoza Karimova");
  await validate(getAcademicDashboard("STUDENT"));
  const courses = await validate(getCourses("STUDENT"));
  const course = await validate(getCourse(courses[0].id, "STUDENT"));
  assert.equal(course.professor.fullName, "Azizbek Rahmonov");
  assert.deepEqual(
    course.students.map((item) => item.id),
    ["student-1"],
  );
  const assessment = await validate(getAssessment("assessment-follow-up"));
  assert.doesNotMatch(JSON.stringify(assessment), /correctAnswer|"correct"/);
  const answers = assessment.questions.map((question) => ({
    questionId: question.id,
    optionId: "option-right",
  }));
  const result = await validate(submitAssessment(assessment.id, { answers }));
  assert.equal(result.scorePercentage, 100);
  const mastery = await validate(getMastery(course.id));
  assert.equal(mastery.overallPercentage, 100);
  await validate(getLearningPlan(course.id));
  await validate(generateLearningPlan(course.id));
  const dashboard = await validate(getOpportunityDashboard());
  assert.ok(
    dashboard.availableProfessors.some(
      (professor) => professor.id === course.professorId,
    ),
  );
  await validate(
    updateCareerProfile({
      targetRole: dashboard.profile.targetRole,
      targetRoleId: dashboard.profile.targetRoleId,
      interests: ["Dasturlash"],
      consent: {
        discoverable: true,
        peerRecommendations: true,
        professorEvidenceReview: true,
      },
    }),
  );
  const recommendations = await validate(getRecommendations());
  await validate(
    updateRecommendation(recommendations[0].id, { status: "SAVED" }),
  );
  const requestBody = {
    professorId: course.professorId,
    opportunityId: "opportunity-5",
    targetRole: dashboard.profile.targetRole,
    consentToReview: true,
  };
  const request = await validate(requestEndorsement(requestBody));
  assert.equal(
    (await validate(requestEndorsement(requestBody))).id,
    request.id,
  );
  await validate(getSurveys("STUDENT"));
  useAuthStore.getState().logout();
  assert.equal(useAuthStore.getState().accessToken, null);
  const professor = await signIn("professor@uniloop.local");
  assert.equal(sessionProfileId(), "professor-azizbek");
  await validate(getAcademicDashboard("PROFESSOR"));
  await validate(getCourses("PROFESSOR"));
  await validate(getCourse(course.id, "PROFESSOR"));
  await validate(
    getAssessment(assessment.id, undefined, undefined, "PROFESSOR"),
  );
  await validate(getClassInsight(course.id));
  const interventions = await validate(getInterventions(course.id));
  await validate(
    decideIntervention(course.id, interventions[0].id, { status: "REJECTED" }),
  );
  await validate(suggestInterventions(course.id));
  await validate(getProfessorGrowthPlan());
  await validate(generateProfessorGrowthPlan());
  await validate(
    uploadCourseMaterial(course.id, {
      title: "API smoke material",
      content: "Vaqtinchalik disposable test materiali.",
    }),
  );
  for (const action of [
    () => extractCourseOutcomes(course.id),
    () => generateCourseAssessment(course.id, "DIAGNOSTIC"),
  ]) {
    await assert.rejects(
      action,
      (error) => error instanceof ApiError && error.code === "UNAVAILABLE",
    );
    checks++;
  }
  const candidates = await validate(getReferralCandidates());
  assert.ok(
    candidates.some((candidate) => candidate.request.id === request.id),
  );
  await validate(getStudentEvidence("student-1"));
  if (request.status === "REQUESTED")
    await validate(
      decideEndorsement({
        requestId: request.id,
        status: "DECLINED",
        feedback: "Smoke tekshiruvi yakunlandi.",
      }),
    );
  const surveys = await validate(getSurveys("PROFESSOR"));
  assert.equal(surveys[0].externalUrl, null);
  useAuthStore.getState().setSession("invalid-access-token", professor.user);
  await assert.rejects(
    () => getIdentity(),
    (error) => error instanceof ApiError && error.code === "UNAUTHORIZED",
  );
  assert.equal(useAuthStore.getState().role, null);
  assert.equal(useAuthStore.getState().user, null);
  assert.equal(useAuthStore.getState().accessToken, null);
  console.log(
    `PASS: ${checks} live frontend feature API/Zod/adapter checks across both roles; central Bearer injection, actual profile identity, unavailable workflows, logout and 401 session clearing verified.`,
  );
} finally {
  useAuthStore.getState().logout();
}
