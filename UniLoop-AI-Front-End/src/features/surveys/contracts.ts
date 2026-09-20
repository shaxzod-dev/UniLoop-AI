import { z } from "zod";
import { dtoEnvelope, idSchema, roleSchema } from "@/lib/api/schemas";
export const surveySchema = z.object({
  id: idSchema,
  title: z.string(),
  description: z.string(),
  audience: roleSchema,
  estimatedMinutes: z.number().int().positive(),
  active: z.boolean(),
  externalUrl: z.string().nullable().optional(),
});
export const surveysResponseSchema = dtoEnvelope(z.array(surveySchema));
