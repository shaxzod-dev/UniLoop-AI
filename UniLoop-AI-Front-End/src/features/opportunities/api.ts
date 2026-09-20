import {
  adaptOpportunityDashboard,
  adaptProfile,
  adaptRecommendations,
  adaptRecommendation,
} from "@/features/opportunities/adapters";
import {
  opportunityResponseSchema,
  clubJoinResponseSchema,
  clubsResponseSchema,
  clubResponseSchema,
  profileResponseSchema,
  recommendationsResponseSchema,
  recommendationResponseSchema,
} from "@/features/opportunities/contracts";
import { adaptEndorsement } from "@/features/referrals/adapters";
import { endorsementResponseSchema } from "@/features/referrals/contracts";
import type {
  CareerProfileUpdate,
  RecommendationUpdate,
  ClubInput,
  ClubCatalogItem,
} from "@/types/opportunity";
import type { EndorsementRequestInput } from "@/types/endorsement";
import { getApiClient, type ApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
export function getOpportunityDashboard(
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.opportunityDashboard(), role: "STUDENT", signal },
    opportunityResponseSchema,
    adaptOpportunityDashboard,
  );
}
export function getRecommendations(
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.recommendations(), role: "STUDENT", signal },
    recommendationsResponseSchema,
    adaptRecommendations,
  );
}
export function updateCareerProfile(
  input: CareerProfileUpdate,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.careerProfile(), role: "STUDENT", body: input },
    profileResponseSchema,
    adaptProfile,
  );
}
export function createClub(
  input: ClubInput,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.createClub(), role: "STUDENT", body: input },
    clubResponseSchema,
    (dto) => dto.data,
  );
}
export function getClubs(signal?: AbortSignal, client: ApiClient = getApiClient()): Promise<ClubCatalogItem[]> {
  return client.request(
    { endpoint: endpoints.clubs(), role: "STUDENT", signal },
    clubsResponseSchema,
    (dto) => dto.data,
  );
}
export function joinClub(
  clubId: string,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.joinClub(clubId), role: "STUDENT" },
    clubJoinResponseSchema,
    (dto) => dto.data,
  );
}
export function updateRecommendation(
  recommendationId: string,
  input: RecommendationUpdate,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    {
      endpoint: endpoints.updateRecommendation(recommendationId),
      role: "STUDENT",
      body: input,
    },
    recommendationResponseSchema,
    adaptRecommendation,
  );
}
export function requestEndorsement(
  input: EndorsementRequestInput,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.requestEndorsement(), role: "STUDENT", body: input },
    endorsementResponseSchema,
    adaptEndorsement,
  );
}
