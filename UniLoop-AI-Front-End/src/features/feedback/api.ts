import { z } from "zod";
import { getApiClient, type ApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { createFeedbackInputSchema, feedbackListResponseSchema, feedbackResponseSchema } from "@/features/feedback/contracts";
import { env } from "@/lib/env";

export function getMyFeedback(signal?: AbortSignal, client: ApiClient = getApiClient()) {
  if (env.useMocks) return Promise.resolve([]);
  return client.request({ endpoint: endpoints.feedbackMine(), signal }, feedbackListResponseSchema, (dto) => dto.data);
}
export function createFeedback(input: z.output<typeof createFeedbackInputSchema>, client: ApiClient = getApiClient()) {
  return client.request({ endpoint: endpoints.createFeedback(), body: createFeedbackInputSchema.parse(input) }, feedbackResponseSchema, (dto) => dto.data);
}
