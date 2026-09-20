import { z } from "zod";
import { dtoEnvelope, idSchema, roleSchema } from "@/lib/api/schemas";
import { t } from "@/i18n";
export const loginInputSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: t("loginEmailInvalid") })),
    password: z
      .string()
      .min(8, t("loginPasswordInvalid"))
      .max(200, t("loginPasswordInvalid")),
  })
  .strict();
export const registerInputSchema = z
  .object({
    name: z.string().trim().min(2, "Ism-familiyangizni kiriting.").max(200),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: t("loginEmailInvalid") })),
    password: z
      .string()
      .min(8, t("loginPasswordInvalid"))
      .max(200, t("loginPasswordInvalid")),
    role: roleSchema,
  })
  .strict();
export const authenticatedUserSchema = z.object({
  id: idSchema,
  profileId: idSchema,
  fullName: z.string().min(1),
  role: roleSchema,
  university: z.string(),
  faculty: z.string(),
  avatarLabel: z.string().min(1),
  onboardingCompleted: z.boolean(),
});
export const loginResponseSchema = dtoEnvelope(
  z.object({ accessToken: z.string().min(1), user: authenticatedUserSchema }),
);
export const registerResponseSchema = loginResponseSchema;
export const meResponseSchema = dtoEnvelope(authenticatedUserSchema);
export const onboardingInputSchema = z.object({
  university: z.string().trim().min(2).max(200),
  faculty: z.string().trim().min(2).max(200).optional(),
  major: z.string().trim().max(200).optional(),
  studyYear: z.number().int().min(1).max(12).optional(),
  bio: z.string().trim().max(2000).optional(),
  targetRole: z.string().trim().min(2).max(200).optional(),
  interests: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
  skills: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  availability: z.string().trim().max(100).optional(),
  discoverable: z.boolean().optional(),
  peerRecommendations: z.boolean().optional(),
  professorEvidenceReview: z.boolean().optional(),
  title: z.string().trim().max(200).optional(),
  department: z.string().trim().max(200).optional(),
  expertise: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
}).strict();
export const onboardingResponseSchema = dtoEnvelope(z.object({
  user: authenticatedUserSchema,
  onboardingCompleted: z.literal(true),
}));
