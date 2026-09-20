export type InterventionStatus = "SUGGESTED" | "APPROVED" | "REJECTED";
export interface TeachingIntervention {
  id: string;
  courseId: string;
  professorId: string;
  outcomeId: string;
  reason: string;
  suggestedAction: string;
  affectedStudentCount: number;
  evidenceAssessmentIds: string[];
  status: InterventionStatus;
}
export interface InterventionDecision {
  status: "APPROVED" | "REJECTED";
}
export interface ProfessorGrowthPlan {
  id: string;
  professorId: string;
  actions: { title: string; reason: string; courseId: string }[];
}
