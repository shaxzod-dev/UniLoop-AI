import type { MasterySummary } from "@/types/mastery";
import type {
  CareerReadinessStage,
  ProjectEvidence,
  SkillEvidence,
  SkillGap,
} from "@/types/opportunity";
import type { StudentSummary } from "@/types/user";

export type EndorsementStatus =
  "REQUESTED" | "APPROVED" | "DECLINED" | "NEEDS_DEVELOPMENT";
export interface EndorsementRequestInput {
  professorId: string;
  opportunityId?: string;
  targetRole: string;
  consentToReview: boolean;
}
export interface EndorsementDecision {
  requestId: string;
  status: Exclude<EndorsementStatus, "REQUESTED">;
  feedback?: string;
}
export interface EndorsementRequest {
  id: string;
  studentId: string;
  professorId: string;
  opportunityId: string | null;
  targetRole: string;
  consentToReview: boolean;
  status: EndorsementStatus;
  professorFeedback: string | null;
  requestedAt: string;
  history: { status: EndorsementStatus; recordedAt: string }[];
}
export interface StudentEvidence {
  student: StudentSummary;
  targetRole: string;
  readinessStage: CareerReadinessStage;
  gaps: SkillGap[];
  aiSummary: string;
  academic: MasterySummary[];
  projects: ProjectEvidence[];
  technicalSkills: SkillEvidence[];
  collaborationEvidence: string[];
  communicationEvidence: string[];
  reviewConsent: boolean;
  requestIds: string[];
}
export interface ReferralCandidate {
  student: StudentSummary;
  request: EndorsementRequest;
  overallMasteryPercentage: number;
  readinessStage: CareerReadinessStage;
}
