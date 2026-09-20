import type { ApiEndpoint } from "@/lib/api/endpoints";
import type { UserRole } from "@/features/auth/types";

export interface TransportRequest {
  endpoint: ApiEndpoint;
  body?: unknown;
  signal?: AbortSignal;
  query?: Readonly<Record<string, string>>;
  role?: UserRole;
}
export interface ApiTransport {
  request(request: TransportRequest): Promise<unknown>;
}
