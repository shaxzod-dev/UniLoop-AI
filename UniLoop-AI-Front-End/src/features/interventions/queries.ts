"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useQueryContext,
  useRoleMutation,
} from "@/features/auth/query-context";
import {
  decideIntervention,
  generateProfessorGrowthPlan,
  getInterventions,
  getProfessorGrowthPlan,
  suggestInterventions,
} from "@/features/interventions/api";
import { interventionMutationKeys } from "@/features/interventions/invalidation";
import { queryKeys } from "@/lib/api/query-keys";
import type { InterventionDecision } from "@/types/intervention";

export function useInterventions(courseId: string) {
  const context = useQueryContext("PROFESSOR");
  return useQuery({
    queryKey: queryKeys.interventions.byCourse(context.userId, courseId),
    queryFn: ({ signal }) => getInterventions(courseId, signal),
    enabled: context.enabled && !!courseId,
  });
}
export function useDecideIntervention(courseId: string) {
  return useRoleMutation(
    "PROFESSOR",
    (input: InterventionDecision & { interventionId: string }) =>
      decideIntervention(courseId, input.interventionId, {
        status: input.status,
      }),
    (_data, _input, userId) => interventionMutationKeys(userId, courseId),
  );
}
export function useSuggestInterventions(courseId: string) {
  return useRoleMutation<
    Awaited<ReturnType<typeof suggestInterventions>>,
    void
  >(
    "PROFESSOR",
    () => suggestInterventions(courseId),
    (_data, _input, userId) => interventionMutationKeys(userId, courseId),
  );
}
export function useGenerateProfessorGrowthPlan() {
  return useRoleMutation<
    Awaited<ReturnType<typeof generateProfessorGrowthPlan>>,
    void
  >(
    "PROFESSOR",
    () => generateProfessorGrowthPlan(),
    (_data, _input, userId) => [queryKeys.professors.growthPlan(userId)],
  );
}
export function useProfessorGrowthPlan() {
  const context = useQueryContext("PROFESSOR");
  return useQuery({
    queryKey: queryKeys.professors.growthPlan(context.userId),
    queryFn: ({ signal }) => getProfessorGrowthPlan(signal),
    enabled: context.enabled,
  });
}
