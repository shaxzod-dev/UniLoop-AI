"use client";

import { useQuery } from "@tanstack/react-query";
import { getAssessment, submitAssessment } from "@/features/assessments/api";
import { assessmentMutationKeys } from "@/features/assessments/invalidation";
import {
  useQueryContext,
  useRoleMutation,
} from "@/features/auth/query-context";
import { queryKeys } from "@/lib/api/query-keys";
import type { SubmissionRequest } from "@/types/assessment";

export function useAssessment(assessmentId: string) {
  const context = useQueryContext("STUDENT");
  return useQuery({
    queryKey: queryKeys.assessments.detail(context.userId, assessmentId),
    queryFn: ({ signal }) => getAssessment(assessmentId, signal),
    enabled: context.enabled && !!assessmentId,
  });
}
export function useProfessorAssessment(assessmentId: string) {
  const context = useQueryContext("PROFESSOR");
  return useQuery({
    queryKey: queryKeys.assessments.professorDetail(
      context.userId,
      assessmentId,
    ),
    queryFn: ({ signal }) =>
      getAssessment(assessmentId, signal, undefined, "PROFESSOR"),
    enabled: context.enabled && !!assessmentId,
  });
}
export function useSubmitAssessment(assessmentId: string, courseId: string) {
  return useRoleMutation(
    "STUDENT",
    (input: SubmissionRequest) => submitAssessment(assessmentId, input),
    (_data, _input, userId) =>
      assessmentMutationKeys(userId, courseId, assessmentId),
  );
}
