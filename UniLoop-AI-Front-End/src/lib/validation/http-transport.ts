import { createApiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { createHttpTransport } from "@/lib/api/http-transport";
import { z } from "zod";
import { ensure } from "@/lib/validation/mock-data";

export async function expectApiError(
  action: () => Promise<unknown>,
  code: ApiError["code"],
): Promise<void> {
  try {
    await action();
  } catch (error: unknown) {
    ensure(
      error instanceof ApiError && error.code === code,
      `Expected typed ${code} error`,
    );
    return;
  }
  throw new Error(`Missing expected ${code} error`);
}
export async function validateHttpTransport(): Promise<void> {
  const controller = new AbortController();
  let calls = 0;
  const endpoint = endpoints.careerProfile();
  const transport = createHttpTransport({
    baseUrl: "http://localhost:5001/api/v1///",
    getAccessToken: () => "validation-token",
    fetcher: async (url, init) => {
      calls += 1;
      const parsedUrl = new URL(String(url));
      ensure(
        parsedUrl.pathname === "/api/v1" + endpoint.path &&
          parsedUrl.searchParams.get("audience") === "STUDENT",
        "Normalized base URL and encoded query",
      );
      ensure(
        init?.method === "PATCH" &&
          init.signal === controller.signal &&
          init.body === JSON.stringify({ interests: ["Dasturlash"] }),
        "JSON request method, body, signal",
      );
      const headers = new Headers(init.headers);
      ensure(
        headers.get("Authorization") === "Bearer validation-token" &&
          headers.get("Content-Type") === "application/json",
        "Token injection and JSON headers",
      );
      return new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
      });
    },
  });
  const client = createApiClient(transport);
  const value = await client.request(
    {
      endpoint,
      body: { interests: ["Dasturlash"] },
      signal: controller.signal,
      query: { audience: "STUDENT" },
    },
    z.object({ data: z.object({ ok: z.boolean() }) }),
    (dto) => dto.data.ok,
  );
  ensure(value === true && calls === 1, "Successful JSON response validation");
  const empty = createHttpTransport({
    baseUrl: "http://localhost:5001/api/v1",
    fetcher: async () => new Response(null, { status: 204 }),
  });
  ensure(
    (await empty.request({ endpoint: endpoints.professorGrowthPlan() })) ===
      undefined,
    "Empty HTTP response support",
  );
  let unauthorizedCalls = 0;
  for (const [status, code] of [
    [401, "UNAUTHORIZED"],
    [403, "FORBIDDEN"],
    [404, "NOT_FOUND"],
    [422, "VALIDATION_ERROR"],
    [500, "HTTP_ERROR"],
  ] as const) {
    const failed = createHttpTransport({
      baseUrl: "http://localhost:5001/api/v1",
      onUnauthorized: () => {
        unauthorizedCalls += 1;
      },
      fetcher: async () =>
        new Response(
          JSON.stringify({
            code: "BACKEND_ERROR",
            details: { field: "input" },
          }),
          { status },
        ),
    });
    await expectApiError(
      () => failed.request({ endpoint: endpoints.surveys() }),
      code,
    );
  }
  ensure(unauthorizedCalls === 1, "Replaceable 401 callback only runs for 401");
  const malformed = createHttpTransport({
    baseUrl: "http://localhost:5001/api/v1",
    fetcher: async () => new Response("not JSON"),
  });
  await expectApiError(
    () => malformed.request({ endpoint: endpoints.surveys() }),
    "INVALID_RESPONSE",
  );
  const network = createHttpTransport({
    baseUrl: "http://localhost:5001/api/v1",
    fetcher: async () => {
      throw new TypeError("Connection failed");
    },
  });
  await expectApiError(
    () => network.request({ endpoint: endpoints.surveys() }),
    "NETWORK_ERROR",
  );
  controller.abort();
  await expectApiError(
    () => transport.request({ endpoint, signal: controller.signal }),
    "ABORTED",
  );
  ensure(calls === 1, "Already aborted requests never fetch");
  const invalidClient = createApiClient({
    request: async () => ({ data: { unexpected: true } }),
  });
  await expectApiError(
    () =>
      invalidClient.request(
        { endpoint },
        z.object({ data: z.object({ ok: z.boolean() }) }),
        (dto) => dto.data,
      ),
    "INVALID_RESPONSE",
  );
}
