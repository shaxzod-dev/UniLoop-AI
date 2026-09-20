import type { TranslationKey } from "@/i18n";
import type { InterventionStatus } from "@/types/intervention";

export const interventionPresentation: Record<
  InterventionStatus,
  { label: TranslationKey; className: string }
> = {
  SUGGESTED: {
    label: "interventionSuggested",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  APPROVED: {
    label: "interventionApproved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  REJECTED: {
    label: "interventionRejected",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
};
