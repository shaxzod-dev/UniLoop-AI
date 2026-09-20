import { z } from "zod";
import {
  dtoEnvelope,
  evidenceSchema,
  idSchema,
  percentageSchema,
} from "@/lib/api/schemas";
export const masterySchema = z.object({
  courseId: idSchema,
  studentId: idSchema,
  overallPercentage: percentageSchema,
  outcomes: z.array(
    z.object({
      outcomeId: idSchema,
      percentage: percentageSchema,
      level: z.enum(["NEEDS_SUPPORT", "DEVELOPING", "PROFICIENT", "MASTERED"]),
      diagnosticPercentage: percentageSchema.nullable(),
      followUpPercentage: percentageSchema.nullable(),
      change: z.number().min(-100).max(100),
      evidence: z.array(evidenceSchema),
      misconceptionIds: z.array(idSchema),
      misconceptionDescriptions: z.array(z.string()).optional(),
      nextAction: z.string(),
    }),
  ),
});
export const masteryResponseSchema = dtoEnvelope(masterySchema);
