import { queryKeys } from "@/lib/api/query-keys";

export function interventionMutationKeys(
  professorId: string,
  courseId: string,
) {
  return [queryKeys.interventions.byCourse(professorId, courseId)];
}
