import { getApiClient, type ApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  adminOverviewResponseSchema,
  clubDecisionInputSchema,
  clubDecisionResponseSchema,
} from "@/features/admin/contracts";
import type { AdminOverview, ClubDecision } from "@/types/admin";
import type { ClubRecord } from "@/types/opportunity";

export function getAdminOverview(
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
): Promise<AdminOverview> {
  return client.request(
    { endpoint: endpoints.adminOverview(), role: "ADMIN", signal },
    adminOverviewResponseSchema,
    (dto) => dto.data as AdminOverview,
  );
}

export function decideClub(
  clubId: string,
  status: ClubDecision,
  client: ApiClient = getApiClient(),
): Promise<ClubRecord> {
  const input = clubDecisionInputSchema.parse({ status });
  return client.request(
    { endpoint: endpoints.decideClub(clubId), role: "ADMIN", body: input },
    clubDecisionResponseSchema,
    (dto) => dto.data,
  );
}