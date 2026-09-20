export type QuestionType = "MULTIPLE_CHOICE" | "SHORT_ANSWER";
export type AssessmentType = "DIAGNOSTIC" | "FOLLOW_UP";
export interface AnswerOption {
  id: string;
  text: string;
}
export interface Question {
  id: string;
  outcomeId: string;
  type: QuestionType;
  prompt: string;
  options: AnswerOption[];
}
export interface Assessment {
  id: string;
  courseId: string;
  type: AssessmentType;
  title: string;
  questions: Question[];
  estimatedMinutes: number;
}
export interface StudentAnswer {
  questionId: string;
  optionId?: string;
  text?: string;
}
export interface SubmissionRequest {
  answers: StudentAnswer[];
}
export interface QuestionFeedback {
  questionId: string;
  outcomeId: string;
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  misconceptionId: string | null;
  misconception: string | null;
}
export interface OutcomeImpact {
  outcomeId: string;
  previousPercentage: number;
  percentage: number;
  change: number;
}
export interface SubmissionResult {
  id: string;
  assessmentId: string;
  studentId: string;
  submittedAt: string;
  scorePercentage: number;
  feedback: QuestionFeedback[];
  outcomeImpacts: OutcomeImpact[];
  aiExplanation: string;
  nextRecommendedAction: { label: string; href: string };
}
