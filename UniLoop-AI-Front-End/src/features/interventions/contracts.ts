import { z } from "zod";
import { dtoEnvelope, idSchema } from "@/lib/api/schemas";
export const interventionSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  professorId: idSchema,
  outcomeId: idSchema,
  reason: z.string(),
  suggestedAction: z.string(),
  affectedStudentCount: z.number().int().nonnegative(),
  evidenceAssessmentIds: z.array(idSchema),
  status: z.enum(["SUGGESTED", "APPROVED", "REJECTED"]),
});
export const interventionDecisionSchema = z
  .object({ status: z.enum(["APPROVED", "REJECTED"]) })
  .strict();
export const interventionsResponseSchema = dtoEnvelope(
  z.array(interventionSchema),
);
export const interventionResponseSchema = dtoEnvelope(interventionSchema);
export const growthPlanResponseSchema = dtoEnvelope(
  z.object({
    id: idSchema,
    professorId: idSchema,
    actions: z.array(
      z.object({ title: z.string(), reason: z.string(), courseId: idSchema }),
    ),
  }),
);
