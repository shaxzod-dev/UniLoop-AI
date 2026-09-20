import { queryKeys } from "@/lib/api/query-keys";

export function careerProfileMutationKeys(
  studentId: string,
  professorId?: string,
) {
  return [
    queryKeys.opportunities.dashboard(studentId),
    queryKeys.opportunities.recommendations(studentId),
    ...(professorId
      ? [
          queryKeys.referrals.candidates(professorId),
          queryKeys.referrals.evidence(professorId, studentId),
        ]
      : []),
  ];
}
export function recommendationMutationKeys(studentId: string) {
  return [
    queryKeys.opportunities.recommendations(studentId),
    queryKeys.opportunities.dashboard(studentId),
  ];
}
export function endorsementMutationKeys(
  studentId: string,
  professorId: string,
) {
  return [
    queryKeys.opportunities.dashboard(studentId),
    queryKeys.referrals.candidates(professorId),
    queryKeys.referrals.evidence(professorId, studentId),
  ];
}
