import { QueryClient } from "@tanstack/react-query";
import { assessmentMutationKeys } from "@/features/assessments/invalidation";
import { getDemoUser } from "@/features/auth/demo-users";
import { interventionMutationKeys } from "@/features/interventions/invalidation";
import { invalidateQueryKeys, queryKeys } from "@/lib/api/query-keys";
import { ensure } from "@/lib/validation/assertions";

export async function validateQueryInvalidation(): Promise<void> {
  const cache = new QueryClient();
  const studentId = getDemoUser("STUDENT").id;
  const courseId = "course-programming-fundamentals";
  const relevant = queryKeys.mastery.byCourse(studentId, courseId);
  const unrelated = queryKeys.mastery.byCourse(studentId, "course-other");
  const surveys = queryKeys.surveys.byRole("STUDENT", studentId);
  for (const key of [relevant, unrelated, surveys])
    cache.setQueryData(key, { cached: true });
  await invalidateQueryKeys(
    cache,
    assessmentMutationKeys(
      studentId,
      courseId,
      "assessment-recursion-follow-up",
    ),
  );
  ensure(
    cache.getQueryState(relevant)?.isInvalidated &&
      !cache.getQueryState(unrelated)?.isInvalidated &&
      !cache.getQueryState(surveys)?.isInvalidated,
    "Assessment invalidation is scoped to affected resources",
  );
  ensure(
    JSON.stringify(queryKeys.courses.detail("STUDENT", studentId, courseId)) !==
      JSON.stringify(
        queryKeys.courses.detail(
          "PROFESSOR",
          getDemoUser("PROFESSOR").id,
          courseId,
        ),
      ),
    "Role-scoped course caches",
  );
  const professorId = getDemoUser("PROFESSOR").id;
  const intervention = queryKeys.interventions.byCourse(professorId, courseId);
  const otherIntervention = queryKeys.interventions.byCourse(
    professorId,
    "course-other",
  );
  const professorDashboard = queryKeys.professors.dashboard(professorId);
  for (const key of [intervention, otherIntervention, professorDashboard])
    cache.setQueryData(key, { cached: true });
  await invalidateQueryKeys(
    cache,
    interventionMutationKeys(professorId, courseId),
  );
  ensure(
    cache.getQueryState(intervention)?.isInvalidated &&
      !cache.getQueryState(otherIntervention)?.isInvalidated &&
      !cache.getQueryState(professorDashboard)?.isInvalidated,
    "Intervention invalidation is scoped to the affected course",
  );
  cache.clear();
}
