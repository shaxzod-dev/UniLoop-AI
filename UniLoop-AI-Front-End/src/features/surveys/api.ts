import type { UserRole } from "@/features/auth/types";
import { adaptSurveys } from "@/features/surveys/adapters";
import { surveysResponseSchema } from "@/features/surveys/contracts";
import { getApiClient, type ApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
export function getSurveys(
  role: UserRole,
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.surveys(), role, query: { audience: role }, signal },
    surveysResponseSchema,
    adaptSurveys,
  );
}
