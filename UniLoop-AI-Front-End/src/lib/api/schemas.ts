import { z } from "zod";
export const idSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const percentageSchema = z.number().min(0).max(100);
export const timestampSchema = z.string().datetime();
export const roleSchema = z.enum(["STUDENT", "PROFESSOR", "ADMIN"]);
export const evidenceSchema = z.object({
  id: idSchema,
  type: z.enum(["ASSESSMENT", "PROJECT", "PROFESSOR_VERIFICATION"]),
  verification: z.enum(["UNVERIFIED", "VERIFIED", "PENDING"]),
  recordedAt: timestampSchema,
});
export const userFields = {
  id: idSchema,
  fullName: z.string().min(1),
  university: z.string(),
  faculty: z.string(),
  avatarLabel: z.string().min(1),
  universityId: idSchema.nullable(),
  facultyId: idSchema.nullable(),
};
export const studentSchema = z.object({
  ...userFields,
  role: z.literal("STUDENT"),
});
export const professorSchema = z.object({
  ...userFields,
  role: z.literal("PROFESSOR"),
});
export const nextActionSchema = z.object({
  label: z.string(),
  href: z.string().startsWith("/"),
});
export const dtoEnvelope = <T extends z.ZodType>(schema: T) =>
  z.object({ data: schema });
