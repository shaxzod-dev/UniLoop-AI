export type MasteryLevel =
  "NEEDS_SUPPORT" | "DEVELOPING" | "PROFICIENT" | "MASTERED";
export type EvidenceSourceType =
  "ASSESSMENT" | "PROJECT" | "PROFESSOR_VERIFICATION";
export type VerificationStatus = "UNVERIFIED" | "VERIFIED" | "PENDING";
export interface EvidenceSource {
  id: string;
  type: EvidenceSourceType;
  verification: VerificationStatus;
  recordedAt: string;
}
export interface Misconception {
  id: string;
  outcomeId: string;
  description: string;
}
export interface OutcomeMastery {
  outcomeId: string;
  percentage: number;
  level: MasteryLevel;
  diagnosticPercentage: number | null;
  followUpPercentage: number | null;
  change: number;
  evidence: EvidenceSource[];
  misconceptionIds: string[];
  misconceptionDescriptions?: string[];
  nextAction: string;
}
export interface MasterySummary {
  courseId: string;
  studentId: string;
  overallPercentage: number;
  outcomes: OutcomeMastery[];
}
