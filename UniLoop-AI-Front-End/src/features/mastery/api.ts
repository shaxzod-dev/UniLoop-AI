import { adaptMastery } from "@/features/mastery/adapters";
import { masteryResponseSchema } from "@/features/mastery/contracts";
import { getApiClient, type ApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
export function getMastery(
  courseId: string,
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.mastery(courseId), role: "STUDENT", signal },
    masteryResponseSchema,
    adaptMastery,
  );
}
