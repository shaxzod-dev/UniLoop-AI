import { z } from "zod";
import {
  dtoEnvelope,
  idSchema,
  nextActionSchema,
  professorSchema,
  studentSchema,
  timestampSchema,
} from "@/lib/api/schemas";
export const outcomeSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  title: z.string(),
  description: z.string(),
});
export const materialSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  title: z.string(),
  content: z.string(),
  uploadedAt: timestampSchema,
});
export const courseSummaryDtoSchema = z.object({
  id: idSchema,
  title: z.string(),
  code: z.string(),
  professorId: idSchema,
  studentCount: z.number().int().nonnegative(),
  outcomeCount: z.number().int().nonnegative(),
});
const enrollmentStatusSchema = z.enum([
  "AVAILABLE",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ENROLLED",
]);
const courseFitSchema = z.object({
  matchPercentage: z.number().min(0).max(100),
  recommended: z.boolean(),
  prerequisitesMet: z.boolean(),
  unmetPrerequisites: z.array(z.string()),
  factors: z.array(z.string()),
  profileSummary: z.object({ targetRole: z.string().nullable(), interests: z.array(z.string()), coreSkills: z.array(z.string()), verifiedSkills: z.array(z.string()) }),
  assistantSummary: z.string(),
  scoreMethod: z.string(),
});
export const courseCatalogItemSchema = courseSummaryDtoSchema.extend({
  description: z.string(),
  professorName: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  availableForEnrollment: z.boolean(),
  enrollmentStatus: enrollmentStatusSchema,
  enrollmentRequestId: idSchema.nullable(),
  requestedAt: timestampSchema.nullable(),
  decisionNote: z.string().nullable(),
});
export const enrollmentRequestSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  studentId: idSchema,
  studentName: z.string(),
  university: z.string().nullable(),
  faculty: z.string().nullable(),
  major: z.string().nullable(),
  studyYear: z.number().int().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  requestedAt: timestampSchema,
  decidedAt: timestampSchema.nullable(),
  decisionNote: z.string().nullable(),
  courseFit: courseFitSchema,
});
export const courseDetailDtoSchema = courseSummaryDtoSchema.extend({
  description: z.string(),
  professor: professorSchema,
  students: z.array(studentSchema),
  enrollments: z.array(
    z.object({
      studentId: idSchema,
      courseId: idSchema,
      enrolledAt: timestampSchema,
    }),
  ),
  outcomes: z.array(outcomeSchema),
  materials: z.array(materialSchema),
  assessments: z.array(
    z.object({
      id: idSchema,
      courseId: idSchema,
      title: z.string(),
      type: z.enum(["DIAGNOSTIC", "FOLLOW_UP"]),
      questionCount: z.number().int().nonnegative(),
      submissionCount: z.number().int().nonnegative(),
    }),
  ),
  latestFeedback: z.string().nullable(),
});
export const dashboardSchema = z.object({
  userId: idSchema,
  courseIds: z.array(idSchema),
  nextAction: nextActionSchema.nullable(),
  feedback: z.string().nullable(),
});
export const courseListResponseSchema = dtoEnvelope(
  z.array(courseSummaryDtoSchema),
);
export const courseCatalogResponseSchema = dtoEnvelope(
  z.array(courseCatalogItemSchema),
);
export const enrollmentRequestsResponseSchema = dtoEnvelope(
  z.array(enrollmentRequestSchema),
);
export const enrollmentRequestResponseSchema = dtoEnvelope(
  enrollmentRequestSchema.omit({
    studentName: true,
    university: true,
    faculty: true,
    major: true,
    studyYear: true,
    courseFit: true,
  }).extend({ status: enrollmentStatusSchema }),
);
export const courseResponseSchema = dtoEnvelope(courseDetailDtoSchema);
export const dashboardResponseSchema = dtoEnvelope(dashboardSchema);
export const materialInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    content: z.string().trim().min(1).max(100_000),
  })
  .strict();
export const generationInputSchema = z
  .object({ type: z.enum(["DIAGNOSTIC", "FOLLOW_UP"]) })
  .strict();

export const courseAuthoringInputSchema = z.object({
  title: z.string().trim().min(3).max(200),
  code: z.string().trim().min(2).max(40),
  description: z.string().trim().max(5000).optional(),
  shortDescription: z.string().trim().max(500).optional(),
  fullDescription: z.string().trim().max(20000).optional(),
  subject: z.string().trim().max(160).optional(),
  difficulty: z.string().trim().max(80).optional(),
  language: z.string().trim().max(20).optional(),
  weeklyWorkloadHours: z.coerce.number().int().min(1).max(80).optional(),
  prerequisites: z.array(z.string().trim().min(1).max(500)).max(40).default([]),
  targetPrograms: z.array(z.string().trim().min(1).max(160)).max(40).default([]),
  outcomes: z.array(z.object({ statement: z.string().trim().min(3).max(500), description: z.string().trim().max(3000).optional() })).max(80).default([]),
  modules: z.array(z.object({ title: z.string().trim().min(2).max(300), description: z.string().trim().max(3000).optional(), topics: z.array(z.object({ title: z.string().trim().min(2).max(300), description: z.string().trim().max(3000).optional() })).max(60).default([]) })).max(40).default([]),
});
export type CourseAuthoringInput = z.output<typeof courseAuthoringInputSchema>;
const aiSuggestionSchema = z.object({
  shortDescription: z.string(), fullDescription: z.string(), prerequisites: z.array(z.string()),
  outcomes: z.array(z.object({ statement: z.string(), description: z.string(), category: z.string(), careerRelevance: z.string() })),
  modules: z.array(z.object({ title: z.string(), description: z.string(), estimatedMinutes: z.number(), topics: z.array(z.object({ title: z.string(), description: z.string(), estimatedMinutes: z.number() })) })),
  materials: z.array(z.string()), assessmentIdeas: z.array(z.string()), targetStudents: z.array(z.string()), careerRelevance: z.string(), learningPlanConnection: z.string(),
});
export const aiSuggestionResponseSchema = dtoEnvelope(z.object({ id: idSchema, courseId: idSchema, suggestion: aiSuggestionSchema, provider: z.string(), fallback: z.boolean(), approvedAt: timestampSchema.nullable(), createdAt: timestampSchema }));
export const recommendationResponseSchema = dtoEnvelope(z.array(z.object({
  course: z.object({ id: idSchema, title: z.string(), code: z.string(), shortDescription: z.string(), type: z.enum(["OFFICIAL", "SUPPLEMENTARY", "RECOMMENDED"]), subject: z.string().nullable(), difficulty: z.string().nullable(), language: z.string().nullable(), estimatedDurationMinutes: z.number().int().nullable(), weeklyWorkloadHours: z.number().int().nullable(), prerequisites: z.array(z.string()), outcomes: z.array(z.object({ id: idSchema, statement: z.string() })) }),
  matchScore: z.number().min(0).max(100), matchFactors: z.array(z.string()), eligibility: z.object({ eligible: z.boolean(), unmetPrerequisites: z.array(z.string()) }), explanation: z.string(), mayEnroll: z.boolean(), professorApprovalRequired: z.boolean(), enrollmentStatus: enrollmentStatusSchema,
})));
