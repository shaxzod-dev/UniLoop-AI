import { z } from "zod";
import { dtoEnvelope, idSchema } from "@/lib/api/schemas";

export const feedbackCategorySchema = z.enum(["BUG", "FEATURE_REQUEST", "USABILITY", "CONTENT", "OTHER"]);
export const feedbackStatusSchema = z.enum(["NEW", "IN_REVIEW", "PLANNED", "RESOLVED"]);
export const feedbackSchema = z.object({
  id: idSchema,
  category: feedbackCategorySchema,
  rating: z.number().int().min(1).max(5).nullable(),
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(2000),
  anonymous: z.boolean(),
  status: feedbackStatusSchema,
  createdAt: z.string().datetime(),
});
export const feedbackListResponseSchema = dtoEnvelope(z.array(feedbackSchema));
export const feedbackResponseSchema = dtoEnvelope(feedbackSchema);
export const createFeedbackInputSchema = z.object({
  category: feedbackCategorySchema,
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
  anonymous: z.boolean().default(false),
}).strict();
export type Feedback = z.output<typeof feedbackSchema>;
