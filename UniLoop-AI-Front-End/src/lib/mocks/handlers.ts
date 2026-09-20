import { demoUsers } from "@/features/auth/demo-users";
import { ApiError } from "@/lib/api/errors";
import { idSchema } from "@/lib/api/schemas";
import type { TransportRequest } from "@/lib/api/transport";
import { academicMutation } from "@/lib/mocks/academic-mutations";
import { careerMutation } from "@/lib/mocks/career-mutations";
import { nextMutation, type MockDatabase } from "@/lib/mocks/database";
import {
  getInsight,
  getOpportunityDashboard,
  getRecommendations,
  getReferralCandidates,
  getStudentEvidence,
  required,
} from "@/lib/mocks/read-models";
import {
  assessmentDto,
  courseDetailDto,
  courseSummaryDto,
} from "@/lib/mocks/serializers";
import { validateInput } from "@/lib/mocks/validation";
import { clubDecisionInputSchema } from "@/features/admin/contracts";
import type { ClubDecision } from "@/types/admin";

const professorEndpoints = new Set([
  "professorDashboard",
  "professorCourses",
  "courseMaterials",
  "extractOutcomes",
  "generateAssessment",
  "insights",
  "interventions",
  "suggestInterventions",
  "decideIntervention",
  "professorGrowthPlan",
  "referralCandidates",
  "studentEvidence",
  "decideEndorsement",
]);
const adminEndpoints = new Set(["adminOverview", "decideClub"]);
export function handleMockRequest(
  db: MockDatabase,
  request: TransportRequest,
): unknown {
  const { endpoint, role, query } = request;
  if (!role) throw new ApiError("UNAUTHORIZED", 401, "apiUnauthorized");
  if (adminEndpoints.has(endpoint.name) && role !== "ADMIN")
    throw new ApiError("FORBIDDEN", 403, "apiForbidden");
  if (
    !adminEndpoints.has(endpoint.name) &&
    endpoint.name !== "courseDetail" &&
    endpoint.name !== "surveys" &&
    (professorEndpoints.has(endpoint.name)
      ? role !== "PROFESSOR"
      : role !== "STUDENT")
  )
    throw new ApiError("FORBIDDEN", 403, "apiForbidden");
  for (const parameter of Object.values(endpoint.params))
    validateInput(idSchema, parameter);
  const studentId = demoUsers.STUDENT.id;
  const professorId = demoUsers.PROFESSOR.id;
  if (endpoint.name === "adminOverview") {
    const clubs = db.clubs;
    return {
      data: {
        students: db.students,
        professors: db.professors,
        clubs,
        stats: {
          totalStudents: db.students.length,
          totalProfessors: db.professors.length,
          pendingClubs: clubs.filter((item) => item.status === "PENDING").length,
          approvedClubs: clubs.filter((item) => item.status === "APPROVED").length,
          rejectedClubs: clubs.filter((item) => item.status === "REJECTED").length,
        },
      },
    };
  }
  if (endpoint.name === "decideClub") {
    const input = validateInput(clubDecisionInputSchema, request.body) as { status: ClubDecision };
    const club = required(db.clubs, (item) => item.id === endpoint.params.clubId);
    if (club.status !== "PENDING")
      throw new ApiError("CONFLICT", 409, "apiConflict");
    club.status = input.status;
    club.decidedAt = new Date().toISOString();
    nextMutation(db);
    return { data: club };
  }
  if (endpoint.method !== "GET") {
    return [
      "careerProfile",
      "updateRecommendation",
      "requestEndorsement",
      "decideEndorsement",
      "createClub",
    ].includes(endpoint.name)
      ? careerMutation(db, request, studentId, professorId)
      : academicMutation(db, request, studentId, professorId);
  }
  const courseId = endpoint.params.courseId;
  switch (endpoint.name) {
    case "studentDashboard":
    case "professorDashboard": {
      const isStudent = endpoint.name === "studentDashboard";
      const courseIds = db.courses
        .filter((item) =>
          isStudent
            ? item.enrollments.some((entry) => entry.studentId === studentId)
            : item.professorId === professorId,
        )
        .map((item) => item.id);
      const latestSubmission = [...db.submissions]
        .reverse()
        .find((item) => item.studentId === studentId);
      return {
        data: {
          userId: isStudent ? studentId : professorId,
          courseIds,
          nextAction: isStudent
            ? (latestSubmission?.nextRecommendedAction ?? null)
            : { label: "Guruh tahlilini ko‘rish", href: "/professor/courses" },
          feedback: isStudent ? (db.courses[0]?.latestFeedback ?? null) : null,
        },
      };
    }
    case "studentCourses":
      return {
        data: db.courses
          .filter((item) =>
            item.enrollments.some((entry) => entry.studentId === studentId),
          )
          .map(courseSummaryDto),
      };
    case "professorCourses":
      return {
        data: db.courses
          .filter((item) => item.professorId === professorId)
          .map(courseSummaryDto),
      };
    case "courseDetail": {
      const course = required(db.courses, (item) => item.id === courseId);
      if (
        role === "STUDENT"
          ? !course.enrollments.some((item) => item.studentId === studentId)
          : course.professorId !== professorId
      )
        throw new ApiError("FORBIDDEN", 403, "apiForbidden");
      return { data: courseDetailDto(course, role, studentId, db.submissions) };
    }
    case "assessment":
      return {
        data: assessmentDto(
          required(
            db.assessments,
            (item) => item.id === endpoint.params.assessmentId,
          ),
        ),
      };
    case "mastery":
      return {
        data: (() => {
          const mastery = required(
            db.masteries,
            (item) =>
              item.courseId === courseId && item.studentId === studentId,
          );
          return {
            ...mastery,
            outcomes: mastery.outcomes.map((outcome) => ({
              ...outcome,
              misconceptionDescriptions: outcome.misconceptionIds.flatMap(
                (id) => {
                  const misconception = db.misconceptions.find(
                    (item) => item.id === id,
                  );
                  return misconception ? [misconception.description] : [];
                },
              ),
            })),
          };
        })(),
      };
    case "learningPlan":
      return {
        data: required(
          db.learningPlans,
          (item) => item.courseId === courseId && item.studentId === studentId,
        ),
      };
    case "insights":
      return { data: getInsight(db, courseId, professorId) };
    case "interventions": {
      required(
        db.courses,
        (item) => item.id === courseId && item.professorId === professorId,
      );
      return {
        data: db.interventions
          .filter((item) => item.courseId === courseId)
          .map((item) => ({
            ...item,
            affectedStudentCount: db.masteries.filter(
              (entry) =>
                entry.courseId === courseId &&
                entry.outcomes.some(
                  (outcome) =>
                    outcome.outcomeId === item.outcomeId &&
                    outcome.percentage < 70,
                ),
            ).length,
          })),
      };
    }
    case "opportunityDashboard":
      return { data: getOpportunityDashboard(db, studentId) };
    case "professorGrowthPlan":
      return {
        data: {
          id: "growth-plan-professor-demo",
          professorId,
          actions: db.interventions.map((item) => ({
            title: item.suggestedAction,
            reason: item.reason,
            courseId: item.courseId,
          })),
        },
      };
    case "recommendations":
      return { data: getRecommendations(db, studentId) };
    case "referralCandidates":
      return { data: getReferralCandidates(db, professorId) };
    case "studentEvidence":
      return {
        data: getStudentEvidence(db, endpoint.params.studentId, professorId),
      };
    case "surveys": {
      if (query?.audience && query.audience !== role)
        throw new ApiError("FORBIDDEN", 403, "apiForbidden");
      return { data: db.surveys.filter((item) => item.audience === role) };
    }
    default:
      throw new ApiError("NOT_FOUND", 404, "apiNotFound");
  }
}
