import { z } from "zod";
import {
  dtoEnvelope,
  evidenceSchema,
  idSchema,
  percentageSchema,
} from "@/lib/api/schemas";
import { endorsementSchema } from "@/features/referrals/endorsement-contract";
export const consentSchema = z
  .object({
    discoverable: z.boolean(),
    peerRecommendations: z.boolean(),
    professorEvidenceReview: z.boolean(),
  })
  .strict();
export const readinessStageSchema = z.enum([
  "FOUNDATION",
  "PROJECT_READY",
  "INTERNSHIP_READY",
  "JUNIOR_READY",
]);
export const skillGapSchema = z.object({
  skillId: idSchema,
  label: z.string(),
  reason: z.string(),
  requiredEvidence: z.string(),
});
export const skillSchema = z.object({
  skillId: idSchema,
  label: z.string(),
  percentage: percentageSchema,
  sources: z.array(evidenceSchema),
});
export const projectSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  title: z.string(),
  description: z.string(),
  skillIds: z.array(idSchema),
  collaborative: z.boolean(),
  verification: z.enum(["UNVERIFIED", "VERIFIED", "PENDING"]),
});
export const careerProfileSchema = z.object({
  studentId: idSchema,
  targetRole: z.string().min(1),
  targetRoleId: idSchema,
  interests: z.array(z.string()),
  readinessStage: readinessStageSchema,
  skills: z.array(skillSchema),
  consent: consentSchema,
});
export const careerProfileInputSchema = z
  .object({
    targetRole: z.string().trim().min(1).max(200).optional(),
    targetRoleId: idSchema.optional(),
    interests: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
    consent: consentSchema.optional(),
  })
  .strict()
  .refine(
    (value) =>
      (value.targetRole === undefined) === (value.targetRoleId === undefined),
    { message: "Target role and ID must be supplied together" },
  );
export const recommendationStatusSchema = z.enum([
  "NEW",
  "SAVED",
  "ACCEPTED",
  "DISMISSED",
]);
export const recommendationInputSchema = z
  .object({ status: recommendationStatusSchema })
  .strict();
export const opportunitySchema = z.object({
  id: idSchema,
  type: z.enum(["PEER", "MENTOR", "CLUB", "PROJECT", "INTERNSHIP", "JOB"]),
  title: z.string(),
  description: z.string(),
  targetRoleIds: z.array(idSchema),
  skillIds: z.array(idSchema),
  gapSkillIds: z.array(idSchema),
  collaborative: z.boolean(),
  relatedUserId: idSchema.nullable(),
  source: z.string().min(1).max(50).nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  clubMember: z.boolean().optional(),
});
export const clubInputSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(4000),
    topic: z.string().trim().min(1).max(200),
    skills: z.array(z.string().trim().min(1).max(100)).max(12).optional(),
  })
  .strict();
export const clubSchema = z.object({
  id: idSchema,
  title: z.string(),
  topic: z.string(),
  requiredSkills: z.array(z.string()),
});
export const clubJoinSchema = z.object({
  opportunityId: idSchema,
  studentId: idSchema,
  role: z.enum(["OWNER", "MEMBER"]),
  joinedAt: z.string().datetime(),
});
export const clubCatalogItemSchema = z.object({
  id: idSchema,
  title: z.string(),
  description: z.string(),
  skills: z.array(z.string()),
  location: z.string().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  creatorName: z.string(),
  memberCount: z.number().int().nonnegative(),
  membershipRole: z.enum(["OWNER", "MEMBER"]).nullable(),
  mayJoin: z.boolean(),
  submittedAt: z.string().datetime(),
});
export const recommendationSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  opportunity: opportunitySchema,
  matching: z.object({
    targetRoleAlignment: percentageSchema,
    demonstratedSkills: percentageSchema,
    missingSkillRelevance: percentageSchema,
    collaborationFit: percentageSchema,
    evidenceStrength: percentageSchema,
    weightedTotal: percentageSchema,
  }),
  explanation: z.string(),
  status: recommendationStatusSchema,
});
export const opportunityDashboardSchema = z.object({
  profile: careerProfileSchema,
  gaps: z.array(skillGapSchema),
  projects: z.array(projectSchema),
  recommendations: z.array(recommendationSchema),
  endorsementRequests: z.array(endorsementSchema),
  availableProfessors: z.array(
    z.object({ id: idSchema, fullName: z.string().min(1) }),
  ),
});
export const opportunityResponseSchema = dtoEnvelope(
  opportunityDashboardSchema,
);
export const profileResponseSchema = dtoEnvelope(careerProfileSchema);
export const recommendationsResponseSchema = dtoEnvelope(
  z.array(recommendationSchema),
);
export const recommendationResponseSchema = dtoEnvelope(recommendationSchema);
export const clubResponseSchema = dtoEnvelope(clubSchema);
export const clubJoinResponseSchema = dtoEnvelope(clubJoinSchema);
export const clubsResponseSchema = dtoEnvelope(z.array(clubCatalogItemSchema));
