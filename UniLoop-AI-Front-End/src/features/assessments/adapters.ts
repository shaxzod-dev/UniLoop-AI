import { z } from "zod";
import {
  assessmentDtoSchema,
  submissionResponseSchema,
} from "@/features/assessments/contracts";
import type { Assessment, SubmissionResult } from "@/types/assessment";

export function adaptAssessment(
  dto: z.output<typeof assessmentDtoSchema>,
): Assessment {
  return {
    id: dto.id,
    courseId: dto.courseId,
    type: dto.type,
    title: dto.title,
    questions: dto.questions,
    estimatedMinutes: dto.estimatedMinutes,
  };
}
export function adaptSubmission(
  dto: z.output<typeof submissionResponseSchema>,
): SubmissionResult {
  return dto.data;
}
