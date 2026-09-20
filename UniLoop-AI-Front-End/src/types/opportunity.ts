import type { EvidenceSource, VerificationStatus } from "@/types/mastery";
import type { EndorsementRequest } from "@/types/endorsement";
export type OpportunityType =
  "PEER" | "MENTOR" | "CLUB" | "PROJECT" | "INTERNSHIP" | "JOB";
export type RecommendationStatus = "NEW" | "SAVED" | "ACCEPTED" | "DISMISSED";
export type CareerReadinessStage =
  "FOUNDATION" | "PROJECT_READY" | "INTERNSHIP_READY" | "JUNIOR_READY";
export interface SkillEvidence {
  skillId: string;
  label: string;
  percentage: number;
  sources: EvidenceSource[];
}
export interface ProjectEvidence {
  id: string;
  studentId: string;
  title: string;
  description: string;
  skillIds: string[];
  collaborative: boolean;
  verification: VerificationStatus;
}
export interface CareerProfile {
  studentId: string;
  targetRole: string;
  targetRoleId: string;
  interests: string[];
  readinessStage: CareerReadinessStage;
  skills: SkillEvidence[];
  consent: {
    discoverable: boolean;
    peerRecommendations: boolean;
    professorEvidenceReview: boolean;
  };
}
export interface CareerProfileUpdate {
  targetRole?: string;
  targetRoleId?: string;
  interests?: string[];
  consent?: CareerProfile["consent"];
}
export interface SkillGap {
  skillId: string;
  label: string;
  reason: string;
  requiredEvidence: string;
}
export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  description: string;
  targetRoleIds: string[];
  skillIds: string[];
  gapSkillIds: string[];
  collaborative: boolean;
  relatedUserId: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  clubMember?: boolean;
}
export interface MatchingBreakdown {
  targetRoleAlignment: number;
  demonstratedSkills: number;
  missingSkillRelevance: number;
  collaborationFit: number;
  evidenceStrength: number;
  weightedTotal: number;
}
export interface Recommendation {
  id: string;
  studentId: string;
  opportunity: Opportunity;
  matching: MatchingBreakdown;
  explanation: string;
  status: RecommendationStatus;
}
export interface OpportunityDashboard {
  profile: CareerProfile;
  gaps: SkillGap[];
  projects: ProjectEvidence[];
  recommendations: Recommendation[];
  endorsementRequests: EndorsementRequest[];
  availableProfessors: { id: string; fullName: string }[];
}
export interface RecommendationUpdate {
  status: RecommendationStatus;
}
export interface ClubInput {
  title: string;
  description: string;
  topic: string;
  skills?: string[];
}
export type ClubStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface ClubRecord {
  id: string;
  title: string;
  description: string;
  topic: string;
  skills: string[];
  creatorId: string | null;
  creatorName: string;
  status: ClubStatus;
  submittedAt: string;
  decidedAt: string | null;
  memberCount: number;
}
export interface ClubCatalogItem {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string | null;
  status: ClubStatus;
  creatorName: string;
  memberCount: number;
  membershipRole: "OWNER" | "MEMBER" | null;
  mayJoin: boolean;
  submittedAt: string;
}
