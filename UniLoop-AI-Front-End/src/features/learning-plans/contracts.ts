import { z } from "zod";
import { dtoEnvelope, idSchema, timestampSchema } from "@/lib/api/schemas";
export const learningPlanSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  studentId: idSchema,
  createdAt: timestampSchema,
  tasks: z.array(
    z.object({
      id: idSchema,
      outcomeId: idSchema,
      order: z.number().int().nonnegative(),
      title: z.string(),
      type: z.enum([
        "EXPLANATION",
        "PRACTICE",
        "MINI_PROJECT",
        "FOLLOW_UP_DIAGNOSTIC",
      ]),
      status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
      estimatedMinutes: z.number().int().positive(),
      reason: z.string(),
      actionTarget: z.string().startsWith("/"),
    }),
  ),
});
export const learningPlanResponseSchema = dtoEnvelope(learningPlanSchema);
