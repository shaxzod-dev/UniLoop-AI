import {
  adaptCandidates,
  adaptEvidence,
  adaptEndorsement,
} from "@/features/referrals/adapters";
import {
  candidatesResponseSchema,
  evidenceResponseSchema,
  endorsementResponseSchema,
} from "@/features/referrals/contracts";
import type { EndorsementDecision } from "@/types/endorsement";
import { getApiClient, type ApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
export function getReferralCandidates(
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.referralCandidates(), role: "PROFESSOR", signal },
    candidatesResponseSchema,
    adaptCandidates,
  );
}
export function getStudentEvidence(
  studentId: string,
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    {
      endpoint: endpoints.studentEvidence(studentId),
      role: "PROFESSOR",
      signal,
    },
    evidenceResponseSchema,
    adaptEvidence,
  );
}
export function decideEndorsement(
  input: EndorsementDecision,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.decideEndorsement(), role: "PROFESSOR", body: input },
    endorsementResponseSchema,
    adaptEndorsement,
  );
}
