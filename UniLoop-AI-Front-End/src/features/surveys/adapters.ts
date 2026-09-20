import { z } from "zod";
import { surveysResponseSchema } from "@/features/surveys/contracts";
import type { Survey } from "@/types/survey";
export function adaptSurveys(
  dto: z.output<typeof surveysResponseSchema>,
): Survey[] {
  return dto.data.map((survey) => ({
    ...survey,
    externalUrl: normalizeSurveyUrl(survey.externalUrl ?? null),
  }));
}

function normalizeSurveyUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
