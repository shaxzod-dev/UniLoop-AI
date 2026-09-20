import type { TranslationKey } from "@/i18n";

export type ApiErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "INVALID_RESPONSE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "UNAVAILABLE"
  | "RATE_LIMITED"
  | "MOCK_ERROR"
  | "HTTP_ERROR"
  | "ABORTED";
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly messageKey: TranslationKey;
  readonly details?: unknown;
  readonly cause?: unknown;
  constructor(
    code: ApiErrorCode,
    status: number,
    messageKey: TranslationKey,
    details?: unknown,
    cause?: unknown,
  ) {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.messageKey = messageKey;
    this.details = details;
    this.cause = cause;
  }
}
export function abortedError(cause?: unknown) {
  return new ApiError("ABORTED", 0, "apiAborted", undefined, cause);
}
