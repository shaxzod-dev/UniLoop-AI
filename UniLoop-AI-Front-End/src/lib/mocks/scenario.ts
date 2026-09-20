import { z } from "zod";
import type { ApiEndpoint } from "@/lib/api/endpoints";
import type { MockScenario } from "@/types/api";

export const mockDelayMs = 120;
export function applyMockScenario(
  scenario: MockScenario,
  endpoint: ApiEndpoint,
  response: unknown,
): unknown {
  if (scenario === "surveyUnavailable" && endpoint.name === "surveys") {
    const { data } = z.object({ data: z.array(z.unknown()) }).parse(response);
    return {
      data: data.map((item) => ({
        ...z.record(z.string(), z.unknown()).parse(item),
        active: false,
        externalUrl: null,
      })),
    };
  }
  if (scenario !== "empty" || endpoint.method !== "GET") return response;
  const { data } = z.object({ data: z.unknown() }).parse(response);
  if (Array.isArray(data)) return { data: [] };
  const record = z.record(z.string(), z.unknown()).parse(data);
  switch (endpoint.name) {
    case "studentDashboard":
    case "professorDashboard":
      return {
        data: { ...record, courseIds: [], nextAction: null, feedback: null },
      };
    case "courseDetail":
      return {
        data: {
          ...record,
          student_count: 0,
          outcome_count: 0,
          learners: [],
          enrollments: [],
          outcomes: [],
          materials: [],
          assessments: [],
          latest_feedback: null,
        },
      };
    case "assessment":
      return { data: { ...record, questions: [] } };
    case "mastery":
      return { data: { ...record, overallPercentage: 0, outcomes: [] } };
    case "learningPlan":
      return { data: { ...record, tasks: [] } };
    case "insights":
      return {
        data: {
          ...record,
          studentCount: 0,
          cohortMasteryPercentage: 0,
          recentImprovementPercentage: null,
          outcomes: [],
          misconceptions: [],
          questionDifficulty: [],
          supportGroups: [],
          evidenceAssessmentIds: [],
        },
      };
    case "opportunityDashboard":
      return {
        data: {
          ...record,
          profile: {
            ...z.record(z.string(), z.unknown()).parse(record.profile),
            skills: [],
          },
          gaps: [],
          projects: [],
          recommendations: [],
          endorsementRequests: [],
        },
      };
    case "studentEvidence":
      return {
        data: {
          ...record,
          academic: [],
          projects: [],
          technicalSkills: [],
          collaborationEvidence: [],
          communicationEvidence: [],
          gaps: [],
          aiSummary: "",
        },
      };
    default:
      return response;
  }
}
