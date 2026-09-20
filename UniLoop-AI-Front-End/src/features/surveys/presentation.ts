import type { UserRole } from "@/features/auth/types";
import type { TranslationKey } from "@/i18n";

export const surveyAudiencePresentation: Record<
  UserRole,
  { label: TranslationKey }
> = {
  STUDENT: { label: "surveyAudienceStudent" },
  PROFESSOR: { label: "surveyAudienceProfessor" },
  ADMIN: { label: "roleAdmin" },
};
