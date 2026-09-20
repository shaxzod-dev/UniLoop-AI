import type { HttpMethod } from "@/types/api";
const segment = (id: string) => encodeURIComponent(id);
function endpoint<N extends string>(
  name: N,
  method: HttpMethod,
  path: string,
  params: Record<string, string> = {},
) {
  return { name, method, path, params };
}
export const endpoints = {
  register: () => endpoint("register", "POST", "/auth/register"),
  login: () => endpoint("login", "POST", "/auth/login"),
  identity: () => endpoint("identity", "GET", "/auth/me"),
  adminOverview: () => endpoint("adminOverview", "GET", "/admin/overview"),
  decideClub: (clubId: string) =>
    endpoint(
      "decideClub",
      "PATCH",
      `/admin/clubs/${segment(clubId)}`,
      { clubId },
    ),
  onboarding: () => endpoint("onboarding", "POST", "/auth/onboarding"),
  studentDashboard: () =>
    endpoint("studentDashboard", "GET", "/students/me/dashboard"),
  studentProgress: () => endpoint("studentProgress", "GET", "/students/me/progress"),
  professorDashboard: () =>
    endpoint("professorDashboard", "GET", "/professors/me/dashboard"),
  studentCourses: () =>
    endpoint("studentCourses", "GET", "/students/me/courses"),
  courseCatalog: () =>
    endpoint("courseCatalog", "GET", "/students/me/course-catalog"),
  recommendedCourses: () => endpoint("recommendedCourses", "GET", "/students/me/recommended-courses"),
  requestEnrollment: (courseId: string) =>
    endpoint(
      "requestEnrollment",
      "POST",
      `/students/me/courses/${segment(courseId)}/enrollment-requests`,
      { courseId },
    ),
  professorCourses: () =>
    endpoint("professorCourses", "GET", "/professors/me/courses"),
  createProfessorCourse: () =>
    endpoint("createProfessorCourse", "POST", "/professors/me/courses"),
  updateProfessorCourse: (courseId: string) => endpoint("updateProfessorCourse", "PATCH", `/professors/me/courses/${segment(courseId)}`, { courseId }),
  publishProfessorCourse: (courseId: string) => endpoint("publishProfessorCourse", "POST", `/professors/me/courses/${segment(courseId)}/publish`, { courseId }),
  archiveProfessorCourse: (courseId: string) => endpoint("archiveProfessorCourse", "POST", `/professors/me/courses/${segment(courseId)}/archive`, { courseId }),
  courseAiSuggestions: (courseId: string) => endpoint("courseAiSuggestions", "POST", `/professors/me/courses/${segment(courseId)}/ai-suggestions`, { courseId }),
  approveCourseAiSuggestion: (courseId: string, suggestionId: string) => endpoint("approveCourseAiSuggestion", "POST", `/professors/me/courses/${segment(courseId)}/ai-suggestions/${segment(suggestionId)}/approval`, { courseId, suggestionId }),
  enrollmentRequests: (courseId: string) =>
    endpoint(
      "enrollmentRequests",
      "GET",
      `/professors/me/courses/${segment(courseId)}/enrollment-requests`,
      { courseId },
    ),
  decideEnrollmentRequest: (courseId: string, requestId: string) =>
    endpoint(
      "decideEnrollmentRequest",
      "PATCH",
      `/professors/me/courses/${segment(courseId)}/enrollment-requests/${segment(requestId)}`,
      { courseId, requestId },
    ),
  courseDetail: (courseId: string, role: "STUDENT" | "PROFESSOR" = "STUDENT") =>
    endpoint(
      "courseDetail",
      "GET",
      `/${role === "STUDENT" ? "students" : "professors"}/me/courses/${segment(courseId)}`,
      {
        courseId,
      },
    ),
  courseMaterials: (courseId: string) =>
    endpoint(
      "courseMaterials",
      "POST",
      `/professors/me/courses/${segment(courseId)}/materials`,
      { courseId },
    ),
  extractOutcomes: (courseId: string) =>
    endpoint(
      "extractOutcomes",
      "POST",
      `/professors/me/courses/${segment(courseId)}/outcomes/extract`,
      { courseId },
    ),
  generateAssessment: (courseId: string) =>
    endpoint(
      "generateAssessment",
      "POST",
      `/professors/me/courses/${segment(courseId)}/assessments/generate`,
      { courseId },
    ),
  assessment: (
    assessmentId: string,
    role: "STUDENT" | "PROFESSOR" = "STUDENT",
  ) =>
    endpoint(
      "assessment",
      "GET",
      `/${role === "STUDENT" ? "students" : "professors"}/me/assessments/${segment(assessmentId)}`,
      {
        assessmentId,
      },
    ),
  submitAssessment: (assessmentId: string) =>
    endpoint(
      "submitAssessment",
      "POST",
      `/students/me/assessments/${segment(assessmentId)}/submissions`,
      { assessmentId },
    ),
  mastery: (courseId: string) =>
    endpoint("mastery", "GET", `/students/me/mastery/${segment(courseId)}`, {
      courseId,
    }),
  learningPlan: (courseId: string) =>
    endpoint(
      "learningPlan",
      "GET",
      `/students/me/learning-plans/${segment(courseId)}`,
      { courseId },
    ),
  generateLearningPlan: (courseId: string) =>
    endpoint(
      "generateLearningPlan",
      "POST",
      `/students/me/learning-plans/${segment(courseId)}`,
      { courseId },
    ),
  insights: (courseId: string) =>
    endpoint(
      "insights",
      "GET",
      `/professors/me/courses/${segment(courseId)}/insights`,
      { courseId },
    ),
  interventions: (courseId: string) =>
    endpoint(
      "interventions",
      "GET",
      `/professors/me/courses/${segment(courseId)}/interventions`,
      { courseId },
    ),
  suggestInterventions: (courseId: string) =>
    endpoint(
      "suggestInterventions",
      "POST",
      `/professors/me/courses/${segment(courseId)}/interventions`,
      { courseId },
    ),
  decideIntervention: (courseId: string, interventionId: string) =>
    endpoint(
      "decideIntervention",
      "PATCH",
      `/professors/me/courses/${segment(courseId)}/interventions/${segment(interventionId)}`,
      { courseId, interventionId },
    ),
  professorGrowthPlan: () =>
    endpoint("professorGrowthPlan", "POST", "/professors/me/growth-plans"),
  getProfessorGrowthPlan: () =>
    endpoint("professorGrowthPlan", "GET", "/professors/me/growth-plans"),
  opportunityDashboard: () =>
    endpoint(
      "opportunityDashboard",
      "GET",
      "/students/me/opportunity-dashboard",
    ),
  careerProfile: () =>
    endpoint("careerProfile", "PATCH", "/students/me/career-profile"),
  createClub: () => endpoint("createClub", "POST", "/students/me/clubs"),
  clubs: () => endpoint("clubs", "GET", "/students/me/clubs"),
  joinClub: (clubId: string) =>
    endpoint("joinClub", "POST", `/students/me/clubs/${segment(clubId)}/join`, {
      clubId,
    }),
  recommendations: () =>
    endpoint("recommendations", "GET", "/students/me/recommendations"),
  updateRecommendation: (recommendationId: string) =>
    endpoint(
      "updateRecommendation",
      "PATCH",
      `/students/me/recommendations/${segment(recommendationId)}`,
      { recommendationId },
    ),
  requestEndorsement: () =>
    endpoint("requestEndorsement", "POST", "/students/me/endorsement-requests"),
  referralCandidates: () =>
    endpoint("referralCandidates", "GET", "/professors/me/referral-candidates"),
  studentEvidence: (studentId: string) =>
    endpoint(
      "studentEvidence",
      "GET",
      `/professors/me/students/${segment(studentId)}/evidence`,
      { studentId },
    ),
  decideEndorsement: () =>
    endpoint("decideEndorsement", "POST", "/professors/me/endorsements"),
  surveys: () => endpoint("surveys", "GET", "/surveys"),
  feedbackMine: () => endpoint("feedbackMine", "GET", "/feedback/me"),
  createFeedback: () => endpoint("createFeedback", "POST", "/feedback"),
};
export type ApiEndpoint = ReturnType<
  (typeof endpoints)[keyof typeof endpoints]
>;
