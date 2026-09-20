export interface CohortOutcomeInsight {
  outcomeId: string;
  diagnosticPercentage: number | null;
  followUpPercentage: number | null;
  improvement: number | null;
  followUpStudentCount: number;
  supportStudentIds: string[];
}
export interface QuestionDifficulty {
  questionId: string;
  assessmentId: string;
  correctCount: number;
  responseCount: number;
  correctPercentage: number;
  difficultyPercentage: number;
}
export interface StudentSupportGroup {
  id: string;
  outcomeId: string;
  studentIds: string[];
  reason: string;
}
export interface ClassInsight {
  courseId: string;
  professorId: string;
  studentCount: number;
  cohortMasteryPercentage: number;
  recentImprovementPercentage: number | null;
  outcomes: CohortOutcomeInsight[];
  misconceptions: {
    misconceptionId: string;
    outcomeId: string;
    description: string;
    studentIds: string[];
  }[];
  questionDifficulty: QuestionDifficulty[];
  supportGroups: StudentSupportGroup[];
  evidenceAssessmentIds: string[];
  explanation: string;
}
