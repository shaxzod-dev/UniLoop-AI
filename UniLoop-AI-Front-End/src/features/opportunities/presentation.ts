import type { TranslationKey } from "@/i18n";
import { matchingWeights } from "@/features/opportunities/matching";
import type {
  CareerReadinessStage,
  OpportunityType,
  RecommendationStatus,
} from "@/types/opportunity";
import type { EvidenceSourceType, VerificationStatus } from "@/types/mastery";
import type { EndorsementStatus } from "@/types/endorsement";

interface StatusPresentation {
  label: TranslationKey;
  className: string;
}
const neutral = "border-slate-200 bg-slate-50 text-slate-700";
const blue = "border-blue-200 bg-blue-50 text-blue-800";
const green = "border-emerald-200 bg-emerald-50 text-emerald-800";
const amber = "border-amber-200 bg-amber-50 text-amber-900";
export const readinessPresentation: Record<
  CareerReadinessStage,
  StatusPresentation & { explanation: TranslationKey }
> = {
  FOUNDATION: {
    label: "readinessFoundation",
    explanation: "readinessFoundationExplanation",
    className: amber,
  },
  PROJECT_READY: {
    label: "readinessProjectReady",
    explanation: "readinessProjectExplanation",
    className: blue,
  },
  INTERNSHIP_READY: {
    label: "readinessInternshipReady",
    explanation: "readinessInternshipExplanation",
    className: green,
  },
  JUNIOR_READY: {
    label: "readinessJuniorReady",
    explanation: "readinessJuniorExplanation",
    className: green,
  },
};
export const evidenceSourcePresentation: Record<
  EvidenceSourceType,
  StatusPresentation
> = {
  ASSESSMENT: { label: "evidenceAssessment", className: blue },
  PROJECT: { label: "evidenceProject", className: neutral },
  PROFESSOR_VERIFICATION: {
    label: "evidenceProfessorVerification",
    className: green,
  },
};
export const verificationPresentation: Record<
  VerificationStatus,
  StatusPresentation
> = {
  UNVERIFIED: { label: "verificationUnverified", className: neutral },
  PENDING: { label: "verificationPending", className: amber },
  VERIFIED: { label: "verificationVerified", className: green },
};
export const opportunityTypePresentation: Record<
  OpportunityType,
  StatusPresentation
> = {
  PEER: { label: "opportunityPeer", className: blue },
  MENTOR: { label: "opportunityMentor", className: green },
  CLUB: { label: "opportunityClub", className: neutral },
  PROJECT: { label: "opportunityProject", className: blue },
  INTERNSHIP: { label: "opportunityInternship", className: amber },
  JOB: { label: "opportunityJob", className: neutral },
};
export const recommendationPresentation: Record<
  RecommendationStatus,
  StatusPresentation
> = {
  NEW: { label: "recommendationNew", className: blue },
  SAVED: { label: "recommendationSaved", className: amber },
  ACCEPTED: { label: "recommendationAccepted", className: green },
  DISMISSED: { label: "recommendationDismissed", className: neutral },
};
export const endorsementPresentation: Record<
  EndorsementStatus,
  StatusPresentation
> = {
  REQUESTED: { label: "endorsementRequested", className: blue },
  APPROVED: { label: "endorsementApproved", className: green },
  DECLINED: { label: "endorsementDeclined", className: neutral },
  NEEDS_DEVELOPMENT: { label: "endorsementNeedsDevelopment", className: amber },
};
export const consentPresentation: Record<
  "enabled" | "disabled",
  StatusPresentation
> = {
  enabled: { label: "consentEnabled", className: green },
  disabled: { label: "consentDisabled", className: neutral },
};
export const professorDecisionPresentation: Record<
  Exclude<EndorsementStatus, "REQUESTED">,
  StatusPresentation
> = {
  APPROVED: { label: "approveEndorsement", className: green },
  NEEDS_DEVELOPMENT: { label: "recommendDevelopment", className: amber },
  DECLINED: { label: "declineEndorsement", className: neutral },
};
export const matchingFactors = [
  { key: "targetRoleAlignment", label: "matchingRoleAlignment" },
  { key: "demonstratedSkills", label: "matchingDemonstratedSkills" },
  { key: "missingSkillRelevance", label: "matchingGapRelevance" },
  { key: "collaborationFit", label: "matchingCollaboration" },
  { key: "evidenceStrength", label: "matchingEvidenceStrength" },
].map((factor) => ({
  ...factor,
  weight: new Intl.NumberFormat("uz-Latn-UZ", { style: "percent" }).format(
    matchingWeights[factor.key as keyof typeof matchingWeights],
  ),
})) as readonly {
  key: keyof typeof matchingWeights;
  label: TranslationKey;
  weight: string;
}[];

export function formatEvidenceDate(value: string): string {
  return new Intl.DateTimeFormat("uz-Latn-UZ", { dateStyle: "medium" }).format(
    new Date(value),
  );
}
