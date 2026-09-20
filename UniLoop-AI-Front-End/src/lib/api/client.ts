import { z } from "zod";
import { env } from "@/lib/env";
import { ApiError, abortedError } from "@/lib/api/errors";
import { createHttpTransport } from "@/lib/api/http-transport";
import { createMockTransport } from "@/lib/mocks/mock-transport";
import type { ApiTransport, TransportRequest } from "@/lib/api/transport";
import { useAuthStore } from "@/features/auth/store";

export function createApiClient(transport: ApiTransport) {
  return {
    async request<S extends z.ZodType, T>(
      request: TransportRequest,
      schema: S,
      adapt: (dto: z.output<S>) => T,
    ): Promise<T> {
      let payload: unknown;
      try {
        payload = await transport.request(request);
      } catch (cause: unknown) {
        if (cause instanceof ApiError) throw cause;
        if (
          request.signal?.aborted ||
          (cause instanceof Error && cause.name === "AbortError")
        )
          throw abortedError(cause);
        throw new ApiError(
          "NETWORK_ERROR",
          0,
          "apiNetworkError",
          undefined,
          cause,
        );
      }
      const parsed = schema.safeParse(payload);
      if (!parsed.success)
        throw new ApiError(
          "INVALID_RESPONSE",
          502,
          "apiInvalidResponse",
          parsed.error.issues,
        );
      try {
        return adapt(parsed.data);
      } catch (cause: unknown) {
        throw new ApiError(
          "INVALID_RESPONSE",
          502,
          "apiInvalidResponse",
          undefined,
          cause,
        );
      }
    },
  };
}
export type ApiClient = ReturnType<typeof createApiClient>;
let browserClient: ApiClient | undefined;
export function getApiClient(): ApiClient {
  function createClient() {
    return createApiClient(
      env.useMocks
        ? createMockTransport({ scenario: env.mockScenario })
        : createHttpTransport({
            baseUrl: env.apiUrl,
            getAccessToken: () => useAuthStore.getState().accessToken,
            onUnauthorized: (token) => {
              if (!token || token !== useAuthStore.getState().accessToken)
                return;
              useAuthStore.getState().logout();
              if (typeof window !== "undefined")
                window.location.replace("/login");
            },
          }),
    );
  }
  if (typeof window === "undefined") return createClient();
  browserClient ??= createClient();
  return browserClient;
}
