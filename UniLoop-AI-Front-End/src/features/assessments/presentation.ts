import type { TranslationKey } from "@/i18n";
import type { AssessmentType } from "@/types/assessment";

export const assessmentTypePresentation: Record<
  AssessmentType,
  { label: TranslationKey; className: string }
> = {
  DIAGNOSTIC: {
    label: "diagnostic",
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
  FOLLOW_UP: {
    label: "followUp",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
};
