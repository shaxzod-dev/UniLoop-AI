"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useQueryContext,
  useRoleMutation,
} from "@/features/auth/query-context";
import { env } from "@/lib/env";
import { getDemoUser } from "@/features/auth/demo-users";
import type { UserRole } from "@/features/auth/types";
import {
  createProfessorCourse,
  extractCourseOutcomes,
  generateCourseAssessment,
  getCourseCatalog,
  getAcademicDashboard,
  getCourse,
  getCourses,
  getEnrollmentRequests,
  requestEnrollment,
  decideEnrollmentRequest,
  uploadCourseMaterial,
  updateProfessorCourse,
  publishProfessorCourse,
  requestCourseAiSuggestions,
  approveCourseAiSuggestion,
  getRecommendedCourses,
} from "@/features/courses/api";
import { queryKeys } from "@/lib/api/query-keys";
import type { AssessmentType } from "@/types/assessment";
import type { CourseAuthoringInput } from "@/features/courses/contracts";

function useAcademicDashboard(role: UserRole) {
  const context = useQueryContext(role);
  return useQuery({
    queryKey:
      role === "STUDENT"
        ? queryKeys.students.dashboard(context.userId)
        : queryKeys.professors.dashboard(context.userId),
    queryFn: ({ signal }) => getAcademicDashboard(role, signal),
    enabled: context.enabled,
  });
}
export function useStudentDashboard() {
  return useAcademicDashboard("STUDENT");
}
export function useProfessorDashboard() {
  return useAcademicDashboard("PROFESSOR");
}
export function useCourses(role: UserRole) {
  const context = useQueryContext(role);
  return useQuery({
    queryKey:
      role === "STUDENT"
        ? queryKeys.students.courses(context.userId)
        : queryKeys.professors.courses(context.userId),
    queryFn: ({ signal }) => getCourses(role, signal),
    enabled: context.enabled,
  });
}
export function useCourseCatalog() {
  const context = useQueryContext("STUDENT");
  return useQuery({
    queryKey: queryKeys.students.courseCatalog(context.userId),
    queryFn: ({ signal }) => getCourseCatalog(signal),
    enabled: context.enabled,
  });
}
export function useRecommendedCourses() {
  const context = useQueryContext("STUDENT");
  return useQuery({ queryKey: queryKeys.students.recommendedCourses(context.userId), queryFn: ({ signal }) => getRecommendedCourses(signal), enabled: context.enabled });
}
function authoringKeys(professorId: string, courseId: string) {
  return [queryKeys.professors.courses(professorId), queryKeys.professors.dashboard(professorId), queryKeys.courses.detail("PROFESSOR", professorId, courseId)];
}
export function useUpdateProfessorCourse(courseId: string) {
  return useRoleMutation("PROFESSOR", (input: CourseAuthoringInput) => updateProfessorCourse(courseId, input), (_data, _input, professorId) => authoringKeys(professorId, courseId));
}
export function usePublishProfessorCourse(courseId: string) {
  return useRoleMutation("PROFESSOR", () => publishProfessorCourse(courseId), (_data, _input, professorId) => [...authoringKeys(professorId, courseId), queryKeys.students.courseCatalog(getDemoUser("STUDENT").id), queryKeys.students.recommendedCourses(getDemoUser("STUDENT").id)]);
}
export function useCourseAiSuggestions(courseId: string) {
  return useRoleMutation("PROFESSOR", (instruction?: string) => requestCourseAiSuggestions(courseId, instruction), (_data, _input, professorId) => authoringKeys(professorId, courseId));
}
export function useApproveCourseAiSuggestion(courseId: string) {
  return useRoleMutation("PROFESSOR", ({ suggestionId, draft }: { suggestionId: string; draft: CourseAuthoringInput }) => approveCourseAiSuggestion(courseId, suggestionId, draft), (_data, _input, professorId) => authoringKeys(professorId, courseId));
}
export function useCreateProfessorCourse() {
  return useRoleMutation(
    "PROFESSOR",
    (input: { title: string; code: string; description?: string }) =>
      createProfessorCourse(input),
    (_data, _input, professorId) => [
      queryKeys.professors.courses(professorId),
      queryKeys.professors.dashboard(professorId),
    ],
  );
}
export function useEnrollmentRequests(courseId: string) {
  const context = useQueryContext("PROFESSOR");
  return useQuery({
    queryKey: queryKeys.professors.enrollmentRequests(context.userId, courseId),
    queryFn: ({ signal }) => getEnrollmentRequests(courseId, signal),
    enabled: context.enabled && !!courseId,
  });
}
export function useRequestEnrollment(courseId: string) {
  return useRoleMutation(
    "STUDENT",
    () => requestEnrollment(courseId),
    (_data, _input, studentId) => [
      queryKeys.students.courseCatalog(studentId),
      queryKeys.students.courses(studentId),
      queryKeys.students.dashboard(studentId),
    ],
  );
}
export function useDecideEnrollmentRequest(courseId: string) {
  return useRoleMutation(
    "PROFESSOR",
    ({ requestId, ...decision }: {
      requestId: string;
      status: "APPROVED" | "REJECTED";
      feedback?: string;
    }) => decideEnrollmentRequest(courseId, requestId, decision),
    (data, _input, professorId) => [
      queryKeys.professors.enrollmentRequests(professorId, courseId),
      queryKeys.professors.courses(professorId),
      queryKeys.professors.dashboard(professorId),
      queryKeys.courses.detail("PROFESSOR", professorId, courseId),
      queryKeys.students.courseCatalog(data.studentId),
      queryKeys.students.courses(data.studentId),
      queryKeys.students.dashboard(data.studentId),
    ],
  );
}
export function useCourse(courseId: string, role: UserRole, enabled = true) {
  const context = useQueryContext(role);
  return useQuery({
    queryKey: queryKeys.courses.detail(role, context.userId, courseId),
    queryFn: ({ signal }) => getCourse(courseId, role, signal),
    enabled: context.enabled && !!courseId && enabled,
  });
}
function courseMutationKeys(professorId: string, courseId: string) {
  return [
    queryKeys.courses.detail("PROFESSOR", professorId, courseId),
    ...(env.useMocks
      ? [
          queryKeys.courses.detail(
            "STUDENT",
            getDemoUser("STUDENT").id,
            courseId,
          ),
          queryKeys.professors.courses(professorId),
          queryKeys.students.courses(getDemoUser("STUDENT").id),
        ]
      : []),
  ];
}
export function useUploadCourseMaterial(courseId: string) {
  return useRoleMutation(
    "PROFESSOR",
    (input: { title: string; content: string }) =>
      uploadCourseMaterial(courseId, input),
    (_data, _input, userId) => courseMutationKeys(userId, courseId),
  );
}
export function useExtractCourseOutcomes(courseId: string) {
  return useRoleMutation<
    Awaited<ReturnType<typeof extractCourseOutcomes>>,
    void
  >(
    "PROFESSOR",
    () => extractCourseOutcomes(courseId),
    (_data, _input, userId) => courseMutationKeys(userId, courseId),
  );
}
export function useGenerateCourseAssessment(courseId: string) {
  return useRoleMutation(
    "PROFESSOR",
    (type: AssessmentType) => generateCourseAssessment(courseId, type),
    (data, _input, userId) => [
      ...courseMutationKeys(userId, courseId),
      queryKeys.assessments.professorDetail(userId, data.id),
    ],
  );
}
