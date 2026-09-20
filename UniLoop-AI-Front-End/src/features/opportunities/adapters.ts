import { z } from "zod";
import {
  opportunityResponseSchema,
  profileResponseSchema,
  recommendationsResponseSchema,
  recommendationResponseSchema,
} from "@/features/opportunities/contracts";
import type {
  OpportunityDashboard,
  CareerProfile,
  Recommendation,
} from "@/types/opportunity";
export function adaptOpportunityDashboard(
  dto: z.output<typeof opportunityResponseSchema>,
): OpportunityDashboard {
  return dto.data;
}
export function adaptProfile(
  dto: z.output<typeof profileResponseSchema>,
): CareerProfile {
  return dto.data;
}
export function adaptRecommendations(
  dto: z.output<typeof recommendationsResponseSchema>,
): Recommendation[] {
  return dto.data;
}
export function adaptRecommendation(
  dto: z.output<typeof recommendationResponseSchema>,
): Recommendation {
  return dto.data;
}
