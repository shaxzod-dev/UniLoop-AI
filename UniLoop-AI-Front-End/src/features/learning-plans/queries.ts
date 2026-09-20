"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useQueryContext,
  useRoleMutation,
} from "@/features/auth/query-context";
import {
  generateLearningPlan,
  getLearningPlan,
} from "@/features/learning-plans/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useLearningPlan(courseId: string) {
  const context = useQueryContext("STUDENT");
  return useQuery({
    queryKey: queryKeys.learningPlans.byCourse(context.userId, courseId),
    queryFn: ({ signal }) => getLearningPlan(courseId, signal),
    enabled: context.enabled && !!courseId,
  });
}
export function useGenerateLearningPlan(courseId: string) {
  return useRoleMutation<
    Awaited<ReturnType<typeof generateLearningPlan>>,
    void
  >(
    "STUDENT",
    () => generateLearningPlan(courseId),
    (_data, _input, userId) => [
      queryKeys.learningPlans.byCourse(userId, courseId),
      queryKeys.students.dashboard(userId),
    ],
  );
}
