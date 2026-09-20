export type HttpMethod = "GET" | "POST" | "PATCH";
export interface ApiErrorBody {
  code: string;
  message?: string;
  details?: unknown;
}
export type MockScenario =
  "populated" | "empty" | "error" | "surveyUnavailable";
