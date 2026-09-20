import { z } from "zod";
import {
  dtoEnvelope,
  idSchema,
  percentageSchema,
  studentSchema,
} from "@/lib/api/schemas";
import { masterySchema } from "@/features/mastery/contracts";
import {
  projectSchema,
  skillSchema,
  readinessStageSchema,
  skillGapSchema,
} from "@/features/opportunities/contracts";
import { endorsementSchema } from "@/features/referrals/endorsement-contract";
export { endorsementSchema } from "@/features/referrals/endorsement-contract";
export const endorsementInputSchema = z
  .object({
    professorId: idSchema,
    opportunityId: idSchema.optional(),
    targetRole: z.string().trim().min(1).max(200),
    consentToReview: z.boolean(),
  })
  .strict();
export const endorsementDecisionSchema = z
  .object({
    requestId: idSchema,
    status: z.enum(["APPROVED", "DECLINED", "NEEDS_DEVELOPMENT"]),
    feedback: z.string().trim().max(2000).optional(),
  })
  .strict();
export const evidenceSchema = z.object({
  student: studentSchema,
  targetRole: z.string(),
  readinessStage: readinessStageSchema,
  gaps: z.array(skillGapSchema),
  aiSummary: z.string(),
  academic: z.array(masterySchema),
  projects: z.array(projectSchema),
  technicalSkills: z.array(skillSchema),
  collaborationEvidence: z.array(z.string()),
  communicationEvidence: z.array(z.string()),
  reviewConsent: z.boolean(),
  requestIds: z.array(idSchema),
});
export const candidatesResponseSchema = dtoEnvelope(
  z.array(
    z.object({
      student: studentSchema,
      request: endorsementSchema,
      overallMasteryPercentage: percentageSchema,
      readinessStage: readinessStageSchema,
    }),
  ),
);
export const evidenceResponseSchema = dtoEnvelope(evidenceSchema);
export const endorsementResponseSchema = dtoEnvelope(endorsementSchema);
