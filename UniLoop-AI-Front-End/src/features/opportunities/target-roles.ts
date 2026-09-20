import type { TranslationKey } from "@/i18n";
export const targetRoles = [
  { id: "role-frontend-developer", label: "careerRoleFrontend" },
  { id: "role-backend-developer", label: "careerRoleBackend" },
  { id: "role-data-analyst", label: "careerRoleData" },
  { id: "role-fullstack-developer", label: "careerRoleFullstack" },
  { id: "role-devops-engineer", label: "careerRoleDevops" },
] as const satisfies readonly { id: string; label: TranslationKey }[];
