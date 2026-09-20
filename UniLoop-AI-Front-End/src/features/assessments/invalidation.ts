import { getDemoUser } from "@/features/auth/demo-users";
import { env } from "@/lib/env";
import { queryKeys } from "@/lib/api/query-keys";

export function assessmentMutationKeys(
  studentId: string,
  courseId: string,
  assessmentId: string,
) {
  const professorId = getDemoUser("PROFESSOR").id;
  return [
    queryKeys.assessments.detail(studentId, assessmentId),
    queryKeys.mastery.byCourse(studentId, courseId),
    queryKeys.learningPlans.byCourse(studentId, courseId),
    queryKeys.students.dashboard(studentId),
    queryKeys.courses.detail("STUDENT", studentId, courseId),
    queryKeys.opportunities.dashboard(studentId),
    queryKeys.opportunities.recommendations(studentId),
    ...(env.useMocks
      ? [
          queryKeys.professorInsights.byCourse(professorId, courseId),
          queryKeys.interventions.byCourse(professorId, courseId),
          queryKeys.referrals.candidates(professorId),
          queryKeys.referrals.evidence(professorId, studentId),
        ]
      : []),
  ];
}
