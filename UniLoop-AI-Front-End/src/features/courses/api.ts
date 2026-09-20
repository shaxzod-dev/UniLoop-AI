import { z } from "zod";
import type { UserRole } from "@/features/auth/types";
import {
  adaptCourseDetail,
  adaptCourseCatalogItem,
  adaptCourseSummary,
  adaptDashboard,
} from "@/features/courses/adapters";
import {
  courseListResponseSchema,
  courseSummaryDtoSchema,
  courseCatalogResponseSchema,
  courseResponseSchema,
  enrollmentRequestResponseSchema,
  enrollmentRequestsResponseSchema,
  dashboardResponseSchema,
  materialInputSchema,
  materialSchema,
  outcomeSchema,
  courseAuthoringInputSchema,
  type CourseAuthoringInput,
  aiSuggestionResponseSchema,
  recommendationResponseSchema,
} from "@/features/courses/contracts";
import { adaptAssessment } from "@/features/assessments/adapters";
import { assessmentResponseSchema } from "@/features/assessments/contracts";
import { getApiClient, type ApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { dtoEnvelope } from "@/lib/api/schemas";
import { timestampSchema } from "@/lib/api/schemas";
import type { AssessmentType } from "@/types/assessment";
import type {
  CourseCatalogItem,
  CourseMaterial,
  EnrollmentRequest,
  LearningOutcome,
} from "@/types/course";

export function getAcademicDashboard(
  role: UserRole,
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    {
      endpoint:
        role === "STUDENT"
          ? endpoints.studentDashboard()
          : endpoints.professorDashboard(),
      role,
      signal,
    },
    dashboardResponseSchema,
    adaptDashboard,
  );
}
export function getCourses(
  role: UserRole,
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    {
      endpoint:
        role === "STUDENT"
          ? endpoints.studentCourses()
          : endpoints.professorCourses(),
      role,
      signal,
    },
    courseListResponseSchema,
    (dto) => dto.data.map(adaptCourseSummary),
  );
}
export function createProfessorCourse(
  input: { title: string; code: string; description?: string },
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.createProfessorCourse(), role: "PROFESSOR", body: input },
    dtoEnvelope(courseSummaryDtoSchema),
    (dto) => adaptCourseSummary(dto.data),
  );
}
export function updateProfessorCourse(courseId: string, input: CourseAuthoringInput, client: ApiClient = getApiClient()) {
  const body = courseAuthoringInputSchema.parse(input);
  return client.request({ endpoint: endpoints.updateProfessorCourse(courseId), role: "PROFESSOR", body }, courseResponseSchema, (dto) => adaptCourseDetail(dto.data));
}
export function publishProfessorCourse(courseId: string, client: ApiClient = getApiClient()) {
  return client.request({ endpoint: endpoints.publishProfessorCourse(courseId), role: "PROFESSOR" }, courseResponseSchema, (dto) => adaptCourseDetail(dto.data));
}
export function requestCourseAiSuggestions(courseId: string, instruction?: string, client: ApiClient = getApiClient()) {
  return client.request({ endpoint: endpoints.courseAiSuggestions(courseId), role: "PROFESSOR", body: instruction ? { instruction } : {} }, aiSuggestionResponseSchema, (dto) => dto.data);
}
export function approveCourseAiSuggestion(courseId: string, suggestionId: string, approvedDraft: CourseAuthoringInput, client: ApiClient = getApiClient()) {
  return client.request({ endpoint: endpoints.approveCourseAiSuggestion(courseId, suggestionId), role: "PROFESSOR", body: { approved: true, approvedDraft } }, dtoEnvelope(z.object({ id: z.string(), courseId: z.string(), approved: z.boolean(), approvedAt: timestampSchema.nullable() })), (dto) => dto.data);
}
export function getRecommendedCourses(signal?: AbortSignal, client: ApiClient = getApiClient()) {
  return client.request({ endpoint: endpoints.recommendedCourses(), role: "STUDENT", signal }, recommendationResponseSchema, (dto) => dto.data);
}
export function getCourseCatalog(
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.courseCatalog(), role: "STUDENT", signal },
    courseCatalogResponseSchema,
    (dto): CourseCatalogItem[] => dto.data.map(adaptCourseCatalogItem),
  );
}
export function requestEnrollment(
  courseId: string,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.requestEnrollment(courseId), role: "STUDENT" },
    enrollmentRequestResponseSchema,
    (dto) => dto.data,
  );
}
export function getEnrollmentRequests(
  courseId: string,
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.enrollmentRequests(courseId), role: "PROFESSOR", signal },
    enrollmentRequestsResponseSchema,
    (dto): EnrollmentRequest[] => dto.data,
  );
}
export function decideEnrollmentRequest(
  courseId: string,
  requestId: string,
  input: { status: "APPROVED" | "REJECTED"; feedback?: string },
  client: ApiClient = getApiClient(),
) {
  return client.request(
    {
      endpoint: endpoints.decideEnrollmentRequest(courseId, requestId),
      role: "PROFESSOR",
      body: input,
    },
    enrollmentRequestResponseSchema,
    (dto) => dto.data,
  );
}
export function getCourse(
  courseId: string,
  role: UserRole,
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  const endpointRole = role === "PROFESSOR" ? role : "STUDENT";
  return client.request(
    { endpoint: endpoints.courseDetail(courseId, endpointRole), role, signal },
    courseResponseSchema,
    (dto) => adaptCourseDetail(dto.data),
  );
}
export function uploadCourseMaterial(
  courseId: string,
  input: z.output<typeof materialInputSchema>,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    {
      endpoint: endpoints.courseMaterials(courseId),
      role: "PROFESSOR",
      body: input,
    },
    dtoEnvelope(materialSchema),
    (dto): CourseMaterial => dto.data,
  );
}
export function extractCourseOutcomes(
  courseId: string,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.extractOutcomes(courseId), role: "PROFESSOR" },
    dtoEnvelope(z.array(outcomeSchema)),
    (dto): LearningOutcome[] => dto.data,
  );
}
export function generateCourseAssessment(
  courseId: string,
  type: AssessmentType,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    {
      endpoint: endpoints.generateAssessment(courseId),
      role: "PROFESSOR",
      body: { type },
    },
    assessmentResponseSchema,
    (dto) => adaptAssessment(dto.data),
  );
}
