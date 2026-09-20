"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useQueryContext,
  useRoleMutation,
} from "@/features/auth/query-context";
import {
  decideEndorsement,
  getReferralCandidates,
  getStudentEvidence,
} from "@/features/referrals/api";
import { queryKeys } from "@/lib/api/query-keys";
import { endorsementMutationKeys } from "@/features/opportunities/invalidation";
import type { EndorsementDecision } from "@/types/endorsement";

export function useReferralCandidates() {
  const context = useQueryContext("PROFESSOR");
  return useQuery({
    queryKey: queryKeys.referrals.candidates(context.userId),
    queryFn: ({ signal }) => getReferralCandidates(signal),
    refetchOnMount: "always",
    enabled: context.enabled,
  });
}
export function useStudentEvidence(studentId: string) {
  const context = useQueryContext("PROFESSOR");
  return useQuery({
    queryKey: queryKeys.referrals.evidence(context.userId, studentId),
    queryFn: ({ signal }) => getStudentEvidence(studentId, signal),
    refetchOnMount: "always",
    enabled: context.enabled && !!studentId,
  });
}
export function useDecideEndorsement() {
  return useRoleMutation(
    "PROFESSOR",
    (input: EndorsementDecision) => decideEndorsement(input),
    (data, _input, userId) => endorsementMutationKeys(data.studentId, userId),
  );
}
