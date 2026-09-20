import { z } from "zod";
import {
  dtoEnvelope,
  idSchema,
  nextActionSchema,
  percentageSchema,
  timestampSchema,
} from "@/lib/api/schemas";
export const questionSchema = z
  .object({
    id: idSchema,
    outcomeId: idSchema,
    type: z.enum(["MULTIPLE_CHOICE", "SHORT_ANSWER"]),
    prompt: z.string(),
    options: z.array(z.object({ id: idSchema, text: z.string() }).strict()),
  })
  .strict();
export const assessmentDtoSchema = z
  .object({
    id: idSchema,
    courseId: idSchema,
    type: z.enum(["DIAGNOSTIC", "FOLLOW_UP"]),
    title: z.string(),
    questions: z.array(questionSchema),
    estimatedMinutes: z.number().int().positive(),
  })
  .strict();
export const submissionInputSchema = z
  .object({
    answers: z
      .array(
        z
          .object({
            questionId: idSchema,
            optionId: idSchema.optional(),
            answer: z.string().trim().max(10_000).optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
export const submissionResultSchema = z.object({
  id: idSchema,
  assessmentId: idSchema,
  studentId: idSchema,
  submittedAt: timestampSchema,
  scorePercentage: percentageSchema,
  feedback: z.array(
    z.object({
      questionId: idSchema,
      outcomeId: idSchema,
      correct: z.boolean(),
      correctAnswer: z.string(),
      explanation: z.string(),
      misconceptionId: idSchema.nullable(),
      misconception: z.string().nullable(),
    }),
  ),
  outcomeImpacts: z.array(
    z.object({
      outcomeId: idSchema,
      previousPercentage: percentageSchema,
      percentage: percentageSchema,
      change: z.number().min(-100).max(100),
    }),
  ),
  aiExplanation: z.string(),
  nextRecommendedAction: nextActionSchema,
});
export const assessmentResponseSchema = dtoEnvelope(assessmentDtoSchema);
export const submissionResponseSchema = dtoEnvelope(submissionResultSchema);
