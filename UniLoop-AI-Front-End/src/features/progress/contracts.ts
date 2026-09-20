import { z } from "zod";
import { dtoEnvelope, idSchema, percentageSchema, timestampSchema } from "@/lib/api/schemas";

const readinessFactorSchema = z.object({
  key: z.string(), label: z.string(), weight: z.number().int().positive(), score: percentageSchema, evidence: z.string(),
});
export const progressResponseSchema = dtoEnvelope(z.object({
  academic: z.object({
    courses: z.array(z.object({ id: idSchema, title: z.string(), code: z.string(), mastery: percentageSchema })),
    outcomes: z.array(z.object({ id: idSchema, courseId: idSchema, courseTitle: z.string(), outcomeTitle: z.string(), percentage: percentageSchema, assessmentType: z.string(), assessmentTitle: z.string(), recordedAt: timestampSchema })),
    nextAction: z.string(),
  }),
  readiness: z.object({
    score: percentageSchema,
    stage: z.enum(["FOUNDATION", "PROJECT_READY", "INTERNSHIP_READY", "JUNIOR_READY"]),
    factors: z.array(readinessFactorSchema), nextAction: z.string(),
  }),
}));
export type StudentProgress = z.output<typeof progressResponseSchema>["data"];
