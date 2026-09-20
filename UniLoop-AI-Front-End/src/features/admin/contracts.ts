import { z } from "zod";
import { dtoEnvelope } from "@/lib/api/schemas";

const personSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  role: z.enum(["STUDENT", "PROFESSOR"]),
  university: z.string(),
  faculty: z.string(),
  avatarLabel: z.string(),
  universityId: z.string().nullable(),
  facultyId: z.string().nullable(),
});
const clubSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  topic: z.string(),
  skills: z.array(z.string()),
  creatorId: z.string().nullable(),
  creatorName: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  submittedAt: z.string().datetime(),
  decidedAt: z.string().datetime().nullable(),
  memberCount: z.number().int().nonnegative(),
});
export const adminOverviewResponseSchema = dtoEnvelope(
  z.object({
    students: z.array(personSchema),
    professors: z.array(personSchema),
    clubs: z.array(clubSchema),
    stats: z.object({
      totalStudents: z.number().int().nonnegative(),
      totalProfessors: z.number().int().nonnegative(),
      pendingClubs: z.number().int().nonnegative(),
      approvedClubs: z.number().int().nonnegative(),
      rejectedClubs: z.number().int().nonnegative(),
    }),
  }),
);
export const clubDecisionInputSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
export const clubDecisionResponseSchema = dtoEnvelope(clubSchema);