import type { UserRole } from "@/features/auth/types";
export interface Survey {
  id: string;
  title: string;
  description: string;
  audience: UserRole;
  estimatedMinutes: number;
  active: boolean;
  externalUrl: string | null;
}
