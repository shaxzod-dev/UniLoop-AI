import { adaptInsight } from "@/features/class-insights/adapters";
import { insightResponseSchema } from "@/features/class-insights/contracts";
import { getApiClient, type ApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
export function getClassInsight(
  courseId: string,
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.insights(courseId), role: "PROFESSOR", signal },
    insightResponseSchema,
    adaptInsight,
  );
}
