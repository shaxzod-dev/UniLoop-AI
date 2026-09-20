import type { UserRole } from "@/features/auth/types";
import type { QueryClient, QueryKey } from "@tanstack/react-query";

export async function invalidateQueryKeys(
  client: QueryClient,
  keys: readonly QueryKey[],
): Promise<void> {
  await Promise.all(
    keys.map((queryKey) => client.invalidateQueries({ queryKey, exact: true })),
  );
}

export const queryKeys = {
  students: {
    dashboard: (studentId: string) =>
      ["students", studentId, "dashboard"] as const,
    progress: (studentId: string) => ["students", studentId, "progress"] as const,
    courses: (studentId: string) => ["students", studentId, "courses"] as const,
    courseCatalog: (studentId: string) =>
      ["students", studentId, "course-catalog"] as const,
    recommendedCourses: (studentId: string) =>
      ["students", studentId, "recommended-courses"] as const,
  },
  professors: {
    dashboard: (professorId: string) =>
      ["professors", professorId, "dashboard"] as const,
    courses: (professorId: string) =>
      ["professors", professorId, "courses"] as const,
    enrollmentRequests: (professorId: string, courseId: string) =>
      ["professors", professorId, "courses", courseId, "enrollment-requests"] as const,
    growthPlan: (professorId: string) =>
      ["professors", professorId, "growth-plan"] as const,
  },
  courses: {
    detail: (role: UserRole, userId: string, courseId: string) =>
      ["courses", role, userId, courseId] as const,
  },
  assessments: {
    detail: (studentId: string, assessmentId: string) =>
      ["assessments", studentId, assessmentId] as const,
    professorDetail: (professorId: string, assessmentId: string) =>
      ["assessments", "PROFESSOR", professorId, assessmentId] as const,
  },
  mastery: {
    byCourse: (studentId: string, courseId: string) =>
      ["mastery", studentId, courseId] as const,
  },
  learningPlans: {
    byCourse: (studentId: string, courseId: string) =>
      ["learning-plans", studentId, courseId] as const,
  },
  professorInsights: {
    byCourse: (professorId: string, courseId: string) =>
      ["insights", professorId, courseId] as const,
  },
  interventions: {
    byCourse: (professorId: string, courseId: string) =>
      ["interventions", professorId, courseId] as const,
  },
  opportunities: {
    dashboard: (studentId: string) =>
      ["opportunities", studentId, "dashboard"] as const,
    recommendations: (studentId: string) =>
      ["opportunities", studentId, "recommendations"] as const,
    clubs: (studentId: string) => ["opportunities", studentId, "clubs"] as const,
  },
  referrals: {
    candidates: (professorId: string) =>
      ["referrals", professorId, "candidates"] as const,
    evidence: (professorId: string, studentId: string) =>
      ["referrals", professorId, "evidence", studentId] as const,
  },
  surveys: {
    byRole: (role: UserRole, userId: string) =>
      ["surveys", role, userId] as const,
  },
  feedback: {
    mine: (userId: string) => ["feedback", userId] as const,
  },
  admin: {
    overview: (adminId: string) => ["admin", adminId, "overview"] as const,
  },
};
