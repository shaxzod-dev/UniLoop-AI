import {
  adaptInterventions,
  adaptIntervention,
  adaptGrowthPlan,
} from "@/features/interventions/adapters";
import {
  interventionsResponseSchema,
  interventionResponseSchema,
  growthPlanResponseSchema,
} from "@/features/interventions/contracts";
import type { InterventionDecision } from "@/types/intervention";
import { getApiClient, type ApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
export function getInterventions(
  courseId: string,
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.interventions(courseId), role: "PROFESSOR", signal },
    interventionsResponseSchema,
    adaptInterventions,
  );
}
export function decideIntervention(
  courseId: string,
  interventionId: string,
  input: InterventionDecision,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    {
      endpoint: endpoints.decideIntervention(courseId, interventionId),
      role: "PROFESSOR",
      body: input,
    },
    interventionResponseSchema,
    adaptIntervention,
  );
}
export function suggestInterventions(
  courseId: string,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.suggestInterventions(courseId), role: "PROFESSOR" },
    interventionsResponseSchema,
    adaptInterventions,
  );
}
export function generateProfessorGrowthPlan(
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.professorGrowthPlan(), role: "PROFESSOR" },
    growthPlanResponseSchema,
    adaptGrowthPlan,
  );
}
export function getProfessorGrowthPlan(
  signal?: AbortSignal,
  client: ApiClient = getApiClient(),
) {
  return client.request(
    { endpoint: endpoints.getProfessorGrowthPlan(), role: "PROFESSOR", signal },
    growthPlanResponseSchema,
    adaptGrowthPlan,
  );
}
