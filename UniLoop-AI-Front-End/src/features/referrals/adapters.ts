import { z } from "zod";
import {
  candidatesResponseSchema,
  evidenceResponseSchema,
  endorsementResponseSchema,
} from "@/features/referrals/contracts";
import type {
  ReferralCandidate,
  StudentEvidence,
  EndorsementRequest,
} from "@/types/endorsement";
export function adaptCandidates(
  dto: z.output<typeof candidatesResponseSchema>,
): ReferralCandidate[] {
  return dto.data;
}
export function adaptEvidence(
  dto: z.output<typeof evidenceResponseSchema>,
): StudentEvidence {
  return dto.data;
}
export function adaptEndorsement(
  dto: z.output<typeof endorsementResponseSchema>,
): EndorsementRequest {
  return dto.data;
}
