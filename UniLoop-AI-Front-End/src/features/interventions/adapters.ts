import { z } from "zod";
import {
  interventionsResponseSchema,
  interventionResponseSchema,
  growthPlanResponseSchema,
} from "@/features/interventions/contracts";
import type {
  TeachingIntervention,
  ProfessorGrowthPlan,
} from "@/types/intervention";
export function adaptInterventions(
  dto: z.output<typeof interventionsResponseSchema>,
): TeachingIntervention[] {
  return dto.data;
}
export function adaptIntervention(
  dto: z.output<typeof interventionResponseSchema>,
): TeachingIntervention {
  return dto.data;
}
export function adaptGrowthPlan(
  dto: z.output<typeof growthPlanResponseSchema>,
): ProfessorGrowthPlan {
  return dto.data;
}
