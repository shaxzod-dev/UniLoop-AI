import { ApiError, abortedError } from "@/lib/api/errors";
import type { ApiTransport, TransportRequest } from "@/lib/api/transport";
import { z } from "zod";

const errorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ message: z.string() })),
  }),
});
export interface HttpTransportOptions {
  baseUrl: string;
  getAccessToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: (token: string | null) => void | Promise<void>;
  fetcher?: typeof fetch;
}
export function createHttpTransport(
  options: HttpTransportOptions,
): ApiTransport {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  return {
    async request({
      endpoint,
      body,
      signal,
      query,
    }: TransportRequest): Promise<unknown> {
      if (signal?.aborted) throw abortedError(signal.reason);
      const url = new URL(baseUrl + endpoint.path);
      for (const [key, value] of Object.entries(query ?? {}))
        url.searchParams.set(key, value);
      const headers = new Headers({ Accept: "application/json" });
      if (body !== undefined) headers.set("Content-Type", "application/json");
      const token = await options.getAccessToken?.();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      let response: Response;
      try {
        response = await (options.fetcher ?? fetch)(url, {
          method: endpoint.method,
          headers,
          cache: "no-store",
          signal,
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch (cause: unknown) {
        if (
          signal?.aborted ||
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
      let text: string;
      try {
        text = await response.text();
      } catch (cause: unknown) {
        if (
          signal?.aborted ||
          (cause instanceof Error && cause.name === "AbortError")
        )
          throw abortedError(cause);
        throw new ApiError(
          "INVALID_RESPONSE",
          response.status,
          "apiInvalidResponse",
          undefined,
          cause,
        );
      }
      let payload: unknown;
      if (text.trim()) {
        try {
          payload = JSON.parse(text);
        } catch (cause: unknown) {
          if (response.ok)
            throw new ApiError(
              "INVALID_RESPONSE",
              response.status,
              "apiInvalidResponse",
              undefined,
              cause,
            );
        }
      }
      if (!response.ok) {
        const parsed = errorBodySchema.safeParse(payload);
        if (response.status === 401)
          await options.onUnauthorized?.(token ?? null);
        const code =
          response.status === 401
            ? "UNAUTHORIZED"
            : response.status === 403
              ? "FORBIDDEN"
              : response.status === 404
                ? "NOT_FOUND"
                : response.status === 422 || response.status === 400
                  ? "VALIDATION_ERROR"
                  : response.status === 409
                    ? "CONFLICT"
                    : response.status === 429
                      ? "RATE_LIMITED"
                      : response.status === 503
                        ? "UNAVAILABLE"
                        : response.status >= 500 && parsed.success
                          ? "INTERNAL_ERROR"
                          : "HTTP_ERROR";
        throw new ApiError(
          code,
          response.status,
          code === "UNAUTHORIZED"
            ? "apiUnauthorized"
            : code === "FORBIDDEN"
              ? "apiForbidden"
              : code === "NOT_FOUND"
                ? "apiNotFound"
                : code === "VALIDATION_ERROR"
                  ? "apiValidationError"
                  : code === "CONFLICT"
                    ? "apiConflict"
                    : code === "RATE_LIMITED"
                      ? "apiRateLimited"
                      : code === "UNAVAILABLE"
                        ? "apiUnavailable"
                        : "generalError",
          parsed.success ? parsed.data : undefined,
        );
      }
      return payload;
    },
  };
}
