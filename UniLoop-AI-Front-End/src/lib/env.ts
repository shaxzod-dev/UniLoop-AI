import { z } from "zod";

const defaultApiUrl = "http://localhost:5001/api/v1";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_USE_MOCKS: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_MOCK_SCENARIO: z
    .enum(["populated", "empty", "error", "surveyUnavailable"])
    .default("populated"),
  NEXT_PUBLIC_API_URL: z.string().url().default(defaultApiUrl),
  NEXT_PUBLIC_STUDENT_SURVEY_URL: optionalUrl,
  NEXT_PUBLIC_PROFESSOR_SURVEY_URL: optionalUrl,
});

const rawEnvironment = {
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
  NEXT_PUBLIC_MOCK_SCENARIO: process.env.NEXT_PUBLIC_MOCK_SCENARIO,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_STUDENT_SURVEY_URL: process.env.NEXT_PUBLIC_STUDENT_SURVEY_URL,
  NEXT_PUBLIC_PROFESSOR_SURVEY_URL:
    process.env.NEXT_PUBLIC_PROFESSOR_SURVEY_URL,
};

const parsedEnvironment = publicEnvironmentSchema.safeParse(rawEnvironment);

if (!parsedEnvironment.success) {
  throw new Error(
    `Invalid public environment variables: ${parsedEnvironment.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ")}`,
  );
}

const environment = parsedEnvironment.data;

export const env = {
  useMocks: environment.NEXT_PUBLIC_USE_MOCKS === "true",
  mockScenario: environment.NEXT_PUBLIC_MOCK_SCENARIO,
  apiUrl: environment.NEXT_PUBLIC_API_URL,
  studentSurveyUrl: environment.NEXT_PUBLIC_STUDENT_SURVEY_URL,
  professorSurveyUrl: environment.NEXT_PUBLIC_PROFESSOR_SURVEY_URL,
} as const;
