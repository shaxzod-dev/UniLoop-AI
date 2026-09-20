import { getApiClient, type ApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { progressResponseSchema, type StudentProgress } from "@/features/progress/contracts";

export function getStudentProgress(signal?: AbortSignal, client: ApiClient = getApiClient()): Promise<StudentProgress> {
  return client.request({ endpoint: endpoints.studentProgress(), role: "STUDENT", signal }, progressResponseSchema, (dto) => dto.data);
}
