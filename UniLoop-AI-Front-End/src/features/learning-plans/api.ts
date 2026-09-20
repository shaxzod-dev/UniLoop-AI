import { adaptLearningPlan } from "@/features/learning-plans/adapters";
import { learningPlanResponseSchema } from "@/features/learning-plans/contracts";
import { getApiClient, type ApiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { endpoints } from "@/lib/api/endpoints";
export function getLearningPlan(
  courseId: string,
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client
    .request(
      { endpoint: endpoints.learningPlan(courseId), role: "STUDENT", signal },
      learningPlanResponseSchema,
      adaptLearningPlan,
    )
    .catch((error: unknown) => {
      if (!(error instanceof ApiError) || error.code !== "NOT_FOUND")
        throw error;
      return generateLearningPlan(courseId, client);
    });
}
export function generateLearningPlan(
  courseId: string,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.generateLearningPlan(courseId), role: "STUDENT" },
    learningPlanResponseSchema,
    adaptLearningPlan,
  );
}
