import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
export function validateInput<T extends z.ZodType>(
  schema: T,
  value: unknown,
): z.output<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success)
    throw new ApiError(
      "VALIDATION_ERROR",
      422,
      "apiValidationError",
      parsed.error.issues,
    );
  return parsed.data;
}
