import { ensure } from "@/lib/validation/assertions";
import {
  authenticatedUserSchema,
  loginInputSchema,
} from "@/features/auth/contracts";
import { adaptSurveys } from "@/features/surveys/adapters";
import { assessmentResponseSchema } from "@/features/assessments/contracts";
import { masterySchema } from "@/features/mastery/contracts";
import { studentSchema } from "@/lib/api/schemas";
import { adaptAssessment } from "@/features/assessments/adapters";
import { getCourse } from "@/features/courses/api";
import { createApiClient } from "@/lib/api/client";
import { createHttpTransport } from "@/lib/api/http-transport";
import { createMockTransport } from "@/lib/mocks/mock-transport";
import { createMockDatabase } from "@/lib/mocks/database";
import { courseDetailDto } from "@/lib/mocks/serializers";
import { expectApiError } from "@/lib/validation/http-transport";
import { endpoints } from "@/lib/api/endpoints";

export async function validateV1Contracts(): Promise<void> {
  ensure(
    loginInputSchema.parse({
      email: "  STUDENT1@UNILOOP.LOCAL  ",
      password: "test-only-password",
    }).email === "student1@uniloop.local",
    "Login normalizes email before validation",
  );
  const credentialUrl = adaptSurveys({
    data: [
      {
        id: "survey-credential-link",
      audience: "STUDENT",
      estimatedMinutes: 5,
        title: "Test",
        description: "Test",
        active: true,
        externalUrl: "https://user:password@example.test/survey",
      },
    ],
  });
  ensure(
    credentialUrl[0].externalUrl === null,
    "Survey links cannot contain credentials",
  );
  const identity = authenticatedUserSchema.parse({
    id: "user-student-1",
    profileId: "student-1",
    fullName: "Dilnoza Karimova",
    role: "STUDENT",
    university: "",
    faculty: "",
    avatarLabel: "DK",
    onboardingCompleted: true,
  });
  ensure(
    identity.id !== identity.profileId,
    "User/profile identity distinction",
  );
  studentSchema.parse({
    ...identity,
    id: identity.profileId,
    universityId: null,
    facultyId: null,
  });
  ensure(
    authenticatedUserSchema.safeParse({ ...identity, role: "ADMIN" }).success,
    "Admin identity role is supported",
  );
  const safe = {
    id: "assessment-diagnostic",
    courseId: "course-programming",
    title: "Diagnostika",
    type: "DIAGNOSTIC",
    estimatedMinutes: 5,
    questions: [
      {
        id: "question-one",
        outcomeId: "outcome-one",
        type: "MULTIPLE_CHOICE",
        prompt: "Savol",
        options: [{ id: "option-one", text: "Javob" }],
      },
    ],
  };
  const dto = assessmentResponseSchema.parse({ data: safe });
  ensure(
    adaptAssessment(dto.data).questions.length === 1,
    "Backend camelCase safe fixture adapts without grading keys",
  );
  ensure(
    !assessmentResponseSchema.safeParse({
      data: {
        ...safe,
        questions: [{ ...safe.questions[0], correctAnswer: "option-one" }],
      },
    }).success,
    "Student schema rejects leaked grading fields",
  );
  masterySchema.parse({
    studentId: "student-1",
    courseId: "course-programming",
    overallPercentage: 0,
    outcomes: [
      {
        outcomeId: "outcome-one",
        percentage: 0,
        level: "NEEDS_SUPPORT",
        diagnosticPercentage: null,
        followUpPercentage: null,
        change: 0,
        evidence: [],
        misconceptionIds: [],
        nextAction: "Diagnostikani bajaring",
      },
    ],
  });
  const database = createMockDatabase();
  const course = database.courses[0];
  const studentId = database.students[0].id;
  const mock = createApiClient(createMockTransport({ database, delayMs: 0 }));
  const http = createApiClient(
    createHttpTransport({
      baseUrl: "http://localhost:5001/api/v1",
      fetcher: async (_url, init) => {
        ensure(
          !new Headers(init?.headers).has("Authorization"),
          "Absent token produces no Bearer header",
        );
        return new Response(
          JSON.stringify({
            data: courseDetailDto(
              course,
              "STUDENT",
              studentId,
              database.submissions,
            ),
          }),
        );
      },
    }),
  );
  const [offline, fixture] = await Promise.all([
    getCourse(course.id, "STUDENT", undefined, mock),
    getCourse(course.id, "STUDENT", undefined, http),
  ]);
  ensure(
    JSON.stringify(offline) === JSON.stringify(fixture),
    "Canonical HTTP fixture and mock adapt to equivalent domain objects",
  );
  let token: string | null = "expired-test-token";
  const unauthorized = createHttpTransport({
    baseUrl: "http://localhost:5001/api/v1",
    getAccessToken: () => token,
    onUnauthorized: (presented) => {
      if (presented === token) token = null;
    },
    fetcher: async () =>
      new Response(
        JSON.stringify({
          error: {
            code: "UNAUTHORIZED",
            message: "Do not render this",
            details: [],
          },
        }),
        { status: 401 },
      ),
  });
  await expectApiError(
    () => unauthorized.request({ endpoint: endpoints.identity() }),
    "UNAUTHORIZED",
  );
  ensure(token === null, "401 callback clears the matching token");
  for (const [status, code] of [
    [409, "CONFLICT"],
    [500, "INTERNAL_ERROR"],
    [503, "UNAVAILABLE"],
  ] as const) {
    const failed = createHttpTransport({
      baseUrl: "http://localhost:5001/api/v1",
      fetcher: async () =>
        new Response(
          JSON.stringify({
            error: { code, message: "Untrusted server text", details: [] },
          }),
          { status },
        ),
    });
    await expectApiError(
      () => failed.request({ endpoint: endpoints.identity() }),
      code,
    );
  }
}
