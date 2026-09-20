import { ApiError, abortedError } from "@/lib/api/errors";
import type { ApiTransport } from "@/lib/api/transport";
import { createMockDatabase, type MockDatabase } from "@/lib/mocks/database";
import { handleMockRequest } from "@/lib/mocks/handlers";
import { applyMockScenario, mockDelayMs } from "@/lib/mocks/scenario";
import type { MockScenario } from "@/types/api";

function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortedError(signal.reason));
      return;
    }
    function abort() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(abortedError(signal?.reason));
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);
    signal?.addEventListener("abort", abort, { once: true });
  });
}
export function createMockTransport(
  options: {
    scenario?: MockScenario;
    database?: MockDatabase;
    delayMs?: number;
  } = {},
): ApiTransport {
  const db = options.database ?? createMockDatabase();
  const scenario = options.scenario ?? "populated";
  return {
    async request(request): Promise<unknown> {
      await delay(options.delayMs ?? mockDelayMs, request.signal);
      if (request.signal?.aborted) throw abortedError(request.signal.reason);
      if (scenario === "error")
        throw new ApiError("MOCK_ERROR", 503, "generalError");
      return structuredClone(
        applyMockScenario(
          scenario,
          request.endpoint,
          handleMockRequest(db, request),
        ),
      );
    },
  };
}
