import {
  course,
  diagnostic,
  diagnosticCorrectness,
  faculties,
  followUp,
  misconceptions,
  professor,
  seedTimestamp,
  students,
  university,
} from "@/lib/mocks/data/academic";
import { gradingRules, type GradingRule } from "@/lib/mocks/data/grading";
import {
  initialCareerProfile,
  initialEndorsement,
  opportunities,
  projects,
} from "@/lib/mocks/data/opportunities";
import { surveys } from "@/lib/mocks/data/surveys";
import { createMastery, mean } from "@/lib/mocks/academic-state";
import type { Assessment, SubmissionResult } from "@/types/assessment";
import type { CourseDetail } from "@/types/course";
import type { EndorsementRequest } from "@/types/endorsement";
import type { TeachingIntervention } from "@/types/intervention";
import type { LearningPlan } from "@/types/learning-plan";
import type { MasterySummary, Misconception } from "@/types/mastery";
import type {
  CareerProfile,
  Opportunity,
  ProjectEvidence,
  RecommendationStatus,
} from "@/types/opportunity";
import type { Survey } from "@/types/survey";
import type { ClubRecord } from "@/types/opportunity";
import type {
  Faculty,
  ProfessorSummary,
  StudentSummary,
  University,
} from "@/types/user";

export interface MockDatabase {
  revision: number;
  universities: University[];
  faculties: Faculty[];
  professors: ProfessorSummary[];
  students: StudentSummary[];
  courses: CourseDetail[];
  assessments: Assessment[];
  gradingRules: Record<string, GradingRule>;
  misconceptions: Misconception[];
  submissions: SubmissionResult[];
  masteries: MasterySummary[];
  learningPlans: LearningPlan[];
  interventions: TeachingIntervention[];
  profiles: CareerProfile[];
  projects: ProjectEvidence[];
  opportunities: Opportunity[];
  recommendationStatuses: Record<string, RecommendationStatus>;
  endorsements: EndorsementRequest[];
  surveys: Survey[];
  clubs: ClubRecord[];
}
export function createMockDatabase(): MockDatabase {
  const submissions: SubmissionResult[] = students.map(
    (student, studentIndex) => {
      const feedback = diagnostic.questions.map((question, questionIndex) => {
        const rule = gradingRules[question.id];
        const correct = diagnosticCorrectness[studentIndex][questionIndex];
        return {
          questionId: question.id,
          outcomeId: question.outcomeId,
          correct,
          correctAnswer:
            question.type === "MULTIPLE_CHOICE"
              ? (question.options.find(
                  (option) => option.id === rule.correctOptionId,
                )?.text ?? "")
              : (rule.acceptedAnswers[0] ?? rule.requiredTerms.join(" va ")),
          explanation: correct
            ? rule.correctExplanation
            : rule.incorrectExplanation,
          misconceptionId: correct ? null : rule.misconceptionId,
          misconception: correct ? null : rule.incorrectExplanation,
        };
      });
      return {
        id: `submission-diagnostic-${student.id}`,
        assessmentId: diagnostic.id,
        studentId: student.id,
        submittedAt: seedTimestamp,
        scorePercentage: mean(feedback.map((item) => (item.correct ? 100 : 0))),
        feedback,
        outcomeImpacts: createMastery(
          student.id,
          diagnostic,
          feedback,
        ).outcomes.map((item) => ({
          outcomeId: item.outcomeId,
          previousPercentage: 0,
          percentage: item.percentage,
          change: item.percentage,
        })),
        aiExplanation:
          "Chaqiriqlar tartibi va to‘liq yechim bo‘yicha natijalar o‘quv natijalariga bog‘landi.",
        nextRecommendedAction: {
          label: "Rivojlanish rejasini ko‘rish",
          href: `/student/learning-plan/${course.id}`,
        },
      };
    },
  );
  const masteries = submissions.map((submission, index) =>
    createMastery(
      submission.studentId,
      diagnostic,
      submission.feedback,
      index > 0 && index < 7 ? followUp : undefined,
    ),
  );
  for (const mastery of masteries.filter(
    (item) => item.outcomes[0].followUpPercentage !== null,
  )) {
    const feedback = followUp.questions.map((question) => ({
      questionId: question.id,
      outcomeId: question.outcomeId,
      correct: true,
      correctAnswer:
        question.type === "MULTIPLE_CHOICE"
          ? (question.options.find(
              (option) =>
                option.id === gradingRules[question.id].correctOptionId,
            )?.text ?? "")
          : (gradingRules[question.id].acceptedAnswers[0] ??
            gradingRules[question.id].requiredTerms.join(" va ")),
      explanation: gradingRules[question.id].correctExplanation,
      misconceptionId: null,
      misconception: null,
    }));
    submissions.push({
      id: `submission-follow-up-${mastery.studentId}`,
      assessmentId: followUp.id,
      studentId: mastery.studentId,
      submittedAt: seedTimestamp,
      scorePercentage: 100,
      feedback,
      outcomeImpacts: mastery.outcomes.map((item) => ({
        outcomeId: item.outcomeId,
        previousPercentage: item.diagnosticPercentage ?? 0,
        percentage: item.percentage,
        change: item.change,
      })),
      aiExplanation:
        "Qayta diagnostika barcha o‘quv natijalarida rivojlanishni ko‘rsatdi.",
      nextRecommendedAction: {
        label: "Jamoaviy loyiha topish",
        href: "/student/opportunities",
      },
    });
  }
  const plan: LearningPlan = {
    id: "plan-dilnoza-recursion",
    courseId: course.id,
    studentId: students[0].id,
    createdAt: seedTimestamp,
    tasks: [
      {
        id: "task-recursion-explanation",
        outcomeId: course.outcomes[2].id,
        order: 1,
        title: "Chaqiriqlar qaytishini tushunish",
        type: "EXPLANATION",
        status: "IN_PROGRESS",
        estimatedMinutes: 10,
        reason: "Ketma-ketlik tahlilida aniqlangan xatoni tushuntirish.",
        actionTarget: `/student/courses/${course.id}/materials`,
      },
      {
        id: "task-recursion-practice",
        outcomeId: course.outcomes[2].id,
        order: 2,
        title: "Chaqiriqlarni jadvalda kuzatish",
        type: "PRACTICE",
        status: "NOT_STARTED",
        estimatedMinutes: 15,
        reason: "Chaqiriq va qaytish tartibini alohida kuzatish.",
        actionTarget: `/student/courses/${course.id}/practice`,
      },
      {
        id: "task-recursion-project",
        outcomeId: course.outcomes[3].id,
        order: 3,
        title: "Rekursiya kuzatuvchisi mini-loyihasi",
        type: "MINI_PROJECT",
        status: "NOT_STARTED",
        estimatedMinutes: 30,
        reason: "To‘liq rekursiv yechim yaratish dalilini to‘plash.",
        actionTarget: `/student/courses/${course.id}/project`,
      },
      {
        id: "task-recursion-follow-up",
        outcomeId: course.outcomes[3].id,
        order: 4,
        title: "Qayta diagnostika",
        type: "FOLLOW_UP_DIAGNOSTIC",
        status: "NOT_STARTED",
        estimatedMinutes: 12,
        reason: "Mashqdan keyingi o‘zgarishni tekshirish.",
        actionTarget: `/student/assessments/${followUp.id}`,
      },
    ],
  };
  const interventions: TeachingIntervention[] = course.outcomes
    .slice(2)
    .map((outcome, index) => ({
      id: ["intervention-call-sequence", "intervention-complete-solution"][
        index
      ],
      courseId: course.id,
      professorId: professor.id,
      outcomeId: outcome.id,
      reason:
        "Diagnostika chaqiriqlar qaytishi va to‘liq yechim bo‘yicha qo‘shimcha mashq ehtiyojini ko‘rsatdi.",
      suggestedAction:
        index === 0
          ? "Chaqiriqlar stekini guruh bilan bosqichma-bosqich tahlil qiling."
          : "To‘xtash sharti va natijani qaytarishni juftlikda mashq qildiring.",
      affectedStudentCount: masteries.filter(
        (item) =>
          (item.outcomes.find((entry) => entry.outcomeId === outcome.id)
            ?.percentage ?? 100) < 70,
      ).length,
      evidenceAssessmentIds: [diagnostic.id],
      status: "SUGGESTED",
    }));
  const clubs: ClubRecord[] = opportunities
    .filter((item) => item.type === "CLUB")
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      topic: item.title,
      skills: item.skillIds,
      creatorId: null,
      creatorName: "Universitet hamjamiyati",
      status: "APPROVED",
      submittedAt: seedTimestamp,
      decidedAt: seedTimestamp,
      memberCount: 0,
    }));
  return structuredClone({
    revision: 0,
    universities: [university],
    faculties,
    professors: [professor],
    students,
    courses: [course],
    assessments: [diagnostic, followUp],
    gradingRules,
    misconceptions,
    submissions,
    masteries,
    learningPlans: [plan],
    interventions,
    profiles: [
      initialCareerProfile,
      {
        ...initialCareerProfile,
        studentId: students[1].id,
        consent: {
          discoverable: true,
          peerRecommendations: true,
          professorEvidenceReview: false,
        },
      },
    ],
    projects,
    opportunities,
    recommendationStatuses: {},
    endorsements: [
      { ...initialEndorsement, history: [...initialEndorsement.history] },
    ],
    surveys,
    clubs,
  });
}
export function nextMutation(db: MockDatabase): {
  revision: number;
  recordedAt: string;
} {
  db.revision += 1;
  return {
    revision: db.revision,
    recordedAt: new Date(
      Date.parse(seedTimestamp) + db.revision * 60_000,
    ).toISOString(),
  };
}
