import { z } from "zod";
import { learningPlanResponseSchema } from "@/features/learning-plans/contracts";
import type { LearningPlan } from "@/types/learning-plan";
export function adaptLearningPlan(
  dto: z.output<typeof learningPlanResponseSchema>,
): LearningPlan {
  return dto.data;
}
