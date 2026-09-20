import { z } from "zod";
import { idSchema, timestampSchema } from "@/lib/api/schemas";

export const endorsementStatusSchema = z.enum([
  "REQUESTED",
  "APPROVED",
  "DECLINED",
  "NEEDS_DEVELOPMENT",
]);
export const endorsementSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  professorId: idSchema,
  opportunityId: idSchema.nullable(),
  targetRole: z.string(),
  consentToReview: z.boolean(),
  status: endorsementStatusSchema,
  professorFeedback: z.string().nullable(),
  requestedAt: timestampSchema,
  history: z.array(
    z.object({ status: endorsementStatusSchema, recordedAt: timestampSchema }),
  ),
});
