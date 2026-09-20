"use client";

import { useQuery } from "@tanstack/react-query";
import { env } from "@/lib/env";
import { getDemoUser } from "@/features/auth/demo-users";
import {
  useQueryContext,
  useRoleMutation,
} from "@/features/auth/query-context";
import {
  getOpportunityDashboard,
  createClub,
  joinClub,
  getRecommendations,
  getClubs,
  requestEndorsement,
  updateCareerProfile,
  updateRecommendation,
} from "@/features/opportunities/api";
import { queryKeys } from "@/lib/api/query-keys";
import {
  careerProfileMutationKeys,
  recommendationMutationKeys,
  endorsementMutationKeys,
} from "@/features/opportunities/invalidation";
import type {
  CareerProfileUpdate,
  RecommendationUpdate,
  ClubInput,
} from "@/types/opportunity";
import type { EndorsementRequestInput } from "@/types/endorsement";

export function useOpportunityDashboard() {
  const context = useQueryContext("STUDENT");
  return useQuery({
    queryKey: queryKeys.opportunities.dashboard(context.userId),
    queryFn: ({ signal }) => getOpportunityDashboard(signal),
    enabled: context.enabled,
  });
}
export function useRecommendations() {
  const context = useQueryContext("STUDENT");
  return useQuery({
    queryKey: queryKeys.opportunities.recommendations(context.userId),
    queryFn: ({ signal }) => getRecommendations(signal),
    enabled: context.enabled,
  });
}
export function useUpdateCareerProfile() {
  return useRoleMutation(
    "STUDENT",
    (input: CareerProfileUpdate) => updateCareerProfile(input),
    (_data, _input, userId) =>
      careerProfileMutationKeys(
        userId,
        env.useMocks ? getDemoUser("PROFESSOR").id : undefined,
      ),
  );
}
export function useClubCatalog() {
  const context = useQueryContext("STUDENT");
  return useQuery({
    queryKey: queryKeys.opportunities.clubs(context.userId),
    queryFn: ({ signal }) => getClubs(signal),
    enabled: context.enabled,
  });
}
export function useCreateClub() {
  return useRoleMutation(
    "STUDENT",
    (input: ClubInput) => createClub(input),
    (_data, _input, userId) => [
      queryKeys.opportunities.dashboard(userId),
      queryKeys.opportunities.recommendations(userId),
      queryKeys.opportunities.clubs(userId),
    ],
  );
}
export function useJoinClub() {
  return useRoleMutation(
    "STUDENT",
    (clubId: string) => joinClub(clubId),
    (_data, _input, userId) => [
      queryKeys.opportunities.dashboard(userId),
      queryKeys.opportunities.recommendations(userId),
      queryKeys.opportunities.clubs(userId),
    ],
  );
}
export function useUpdateRecommendation() {
  return useRoleMutation(
    "STUDENT",
    (input: RecommendationUpdate & { recommendationId: string }) =>
      updateRecommendation(input.recommendationId, { status: input.status }),
    (_data, _input, userId) => recommendationMutationKeys(userId),
  );
}
export function useRequestEndorsement() {
  return useRoleMutation(
    "STUDENT",
    (input: EndorsementRequestInput) => requestEndorsement(input),
    (data, _input, userId) => endorsementMutationKeys(userId, data.professorId),
  );
}
